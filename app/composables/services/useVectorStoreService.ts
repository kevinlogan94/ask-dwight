import type { FileObject, FileDeleted } from "openai/resources/files.mjs";

/**
 * A composable service for managing files within an OpenAI vector store using Supabase functions.
 */
export const useVectorStoreService = () => {
  const supabase = useSupabaseClient();

  /**
   * Fetches all files from a specific vector store.
   * It first lists all file IDs in the store and then fetches details for each file concurrently.
   * @param vectorStoreId The ID of the vector store.
   * @returns A promise that resolves to an array of file objects, each with an id and name.
   */
  const fetchFiles = async (vectorStoreId: string): Promise<FileObject[]> => {
    try {
      const { data: listData, error: listError } = await supabase.functions.invoke("list-vector-store-files", {
        body: { vectorStoreId },
      });

      if (listError) {
        throw new Error(`Error fetching file list: ${listError.message}`);
      }

      // Assuming listData.files is an array of objects with an 'id' property
      const files = listData?.files ?? [];
      if (!files || files.length === 0) {
        return [];
      }

      const fileDetailPromises = files.map((file: { id: string }) =>
        supabase.functions.invoke("get-file-details", {
          body: { fileId: file.id },
        }),
      );

      const fileDetailResults = await Promise.all(fileDetailPromises);

      return fileDetailResults;
    } catch (error) {
      console.error("An unexpected error occurred in fetchFiles:", error);
      return [];
    }
  };

  /**
   * Uploads a file to OpenAI and returns its ID.
   * @param file The file object to be uploaded.
   * @returns A promise that resolves with the ID of the uploaded file.
   */
  /**
   * Uploads a file to OpenAI and returns the file object.
   * @param file The file object to be uploaded.
   * @returns A promise that resolves with the OpenAI file object.
   */
  const createFile = async (file: File): Promise<FileObject> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data, error } = await supabase.functions.invoke<FileObject>("upload-file", {
        body: formData,
      });

      if (error) {
        throw new Error(`Error creating file: ${error.message}`);
      }
      if (!data) {
        throw new Error("No data returned from file creation.");
      }

      return data;
    } catch (error) {
      console.error("Error in createFile:", error);
      throw new Error("Failed to create file via Supabase function.");
    }
  };

  /**
   * Adds a new file to a specific vector store.
   * It first uploads the file to OpenAI and then attaches it to the vector store.
   * @param vectorStoreId The ID of the vector store.
   * @param file The file object to be uploaded.
   * @returns A promise that resolves with the result of adding the file to the store.
   */
  const addFile = async (vectorStoreId: string, file: File): Promise<any> => {
    try {
      // First, upload the file to OpenAI to get a file object.
      const fileObject = await createFile(file);

      // Then, attach the file to the vector store.
      const { data: vectorStoreFileData, error: addError } = await supabase.functions.invoke(
        "add-file-to-vector-store",
        {
          body: { vectorStoreId, fileId: fileObject.id },
        },
      );

      if (addError) {
        throw new Error(`Error adding file to vector store: ${addError.message}`);
      }
      if (!vectorStoreFileData) {
        throw new Error("No data returned from adding file to vector store.");
      }

      return vectorStoreFileData;
    } catch (error) {
      console.error("An unexpected error occurred in addFile:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  /**
   * Removes a file from a specific vector store.
   * @param vectorStoreId The ID of the vector store.
   * @param fileId The ID of the file to remove.
   * @returns A promise that resolves with the result of the removal operation.
   */
  const removeFile = async (vectorStoreId: string, fileId: string): Promise<FileDeleted> => {
    try {
      const { data, error } = await supabase.functions.invoke("remove-file-from-vector-store", {
        body: { vectorStoreId, fileId },
      });

      if (error) {
        throw new Error(`Error removing file from vector store: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("An unexpected error occurred in removeFile:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  /**
   * Creates a new vector store.
   * @param name The name for the new vector store.
   * @returns A promise that resolves to the ID of the newly created vector store.
   */
  const createNewStore = async (name: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke("create-vector-store", {
        body: { name },
      });

      if (error) {
        throw new Error(`Error creating new vector store: ${error.message}`);
      }

      // Assuming the response contains the new vector store's ID
      return data.id;
    } catch (error) {
      console.error("An unexpected error occurred in createNewStore:", error);
      return null;
    }
  };

  return {
    fetchFiles,
    createFile,
    addFile,
    removeFile,
    createNewStore,
  };
};
