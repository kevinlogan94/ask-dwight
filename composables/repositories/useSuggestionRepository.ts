/**
 * Repository for suggestion persistence operations
 */
export function useSuggestionRepository() {
  /**
   * Save suggestions to Supabase for a specific assistant response
   */
  async function saveSuggestionsToSupabase(
    assistantResponseId: string,
    suggestions: string[]
  ): Promise<void> {
    const supabase = useSupabaseClient()
    try {
      // Create array of suggestion objects
      const suggestionRecords = suggestions.map(suggestion => ({
        dwight_response_id: assistantResponseId,
        suggestion_text: suggestion
      }))
      
      const { error } = await supabase
        .from('user_prompt_suggestions')
        .insert(suggestionRecords as any)
      
      if (error) {
        console.error('Error saving suggestions to Supabase:', error)
        throw error
      }
      
    } catch (error) {
      console.error('Failed to save suggestions to Supabase:', error)
      throw error
    }
  }
  
  return {
    saveSuggestionsToSupabase,
  }
}
