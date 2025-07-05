import { useSupabaseClient } from '#imports'

/**
 * A composable service for managing files within an OpenAI vector store using Supabase functions.
 */
export const useVectorStoreService = () => {
  const supabase = useSupabaseClient()

  /**
   * Fetches all files from a specific vector store.
   * It first lists all file IDs in the store and then fetches details for each file concurrently.
   * @param vectorStoreId The ID of the vector store.
   * @returns A promise that resolves to an array of file objects, each with an id and name.
   */
  const fetchFiles = async (vectorStoreId: string) => {
    try {
      const { data: listData, error: listError } = await supabase.functions.invoke('list-vector-store-files', {
        body: { vectorStoreId },
      })

      if (listError) {
        throw new Error(`Error fetching file list: ${listError.message}`)
      }

      // Assuming listData.files is an array of objects with an 'id' property
      const files = listData?.files ?? []
      if (!files || files.length === 0) {
        return []
      }

      const fileDetailPromises = files.map((file: { id: string }) =>
        supabase.functions.invoke('get-file-details', {
          body: { fileId: file.id },
        }),
      )

      const fileDetailResults = await Promise.all(fileDetailPromises)

      return fileDetailResults
        .map((result) => {
          if (result.error) {
            console.error(`Error fetching details for a file: ${result.error.message}`)
            return null
          }
          // OpenAI uses filename property, which we map to name.
          const { id, filename } = result.data
          return { id, name: filename }
        })
        .filter(Boolean) as { id: string, name: string }[] // Remove nulls and assert type
    }
    catch (error) {
      console.error('An unexpected error occurred in fetchFiles:', error)
      return []
    }
  }

  /**
   * Adds a new file to a specific vector store.
   * It first uploads the file to OpenAI and then attaches it to the vector store.
   * @param vectorStoreId The ID of the vector store.
   * @param file The file object to be uploaded.
   * @returns A promise that resolves with the result of adding the file to the store.
   */
  const addFile = async (vectorStoreId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const { data: uploadData, error: uploadError } = await supabase.functions.invoke('upload-file', {
        body: formData,
      })

      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`)
      }

      const fileId = uploadData.id // Assuming the response contains the file ID

      const { data: addData, error: addError } = await supabase.functions.invoke('add-file-to-vector-store', {
        body: { vectorStoreId, fileId },
      })

      if (addError) {
        throw new Error(`Error adding file to vector store: ${addError.message}`)
      }

      return addData
    }
    catch (error) {
      console.error('An unexpected error occurred in addFile:', error)
      return null
    }
  }

  /**
   * Removes a file from a specific vector store.
   * @param vectorStoreId The ID of the vector store.
   * @param fileId The ID of the file to remove.
   * @returns A promise that resolves with the result of the removal operation.
   */
  const removeFile = async (vectorStoreId: string, fileId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('remove-file-from-vector-store', {
        body: { vectorStoreId, fileId },
      })

      if (error) {
        throw new Error(`Error removing file from vector store: ${error.message}`)
      }

      return data
    }
    catch (error) {
      console.error('An unexpected error occurred in removeFile:', error)
      return null
    }
  }

  /**
   * Creates a new vector store.
   * @param name The name for the new vector store.
   * @returns A promise that resolves to the ID of the newly created vector store.
   */
  const createNewStore = async (name: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-vector-store', {
        body: { name },
      })

      if (error) {
        throw new Error(`Error creating new vector store: ${error.message}`)
      }

      // Assuming the response contains the new vector store's ID
      return data.id
    }
    catch (error) {
      console.error('An unexpected error occurred in createNewStore:', error)
      return null
    }
  }

  return {
    fetchFiles,
    addFile,
    removeFile,
    createNewStore,
  }
}
