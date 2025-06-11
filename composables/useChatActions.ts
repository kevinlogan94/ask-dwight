import type { Message } from '~/models/chat';
import { useClipboard } from '@vueuse/core'
import { useFeedbackService } from '~/composables/services/useFeedbackService';

export function useChatActions() {
  const toast = useToast();
  const { recordFeedback, toggleReaction } = useFeedbackService();
  const clipboard = useClipboard();


  const handleCopyMessage = async (message: Message) => {
    if (!message.id || !message.content) {
      toast.add({ title: 'Error', description: 'No content to copy.', color: 'warning', icon: 'i-heroicons-exclamation-triangle' });
      return;
    }

    try {
      await clipboard.copy(message.content);
      toast.add({
        title: 'Copied to clipboard',
        description: 'Content copied to clipboard.',
        color: 'success',
        icon: 'i-heroicons-check-circle',
        duration: 2000,
      });
      useTrackEvent('chat_click_copy', {
        event_category: 'engagement',
        event_label: 'copy',
        dwight_response_id: message.id,
      });
      // Record copy action, don't change reaction (pass undefined)
      await recordFeedback(message.id, undefined, true);
    } catch (err) {
      console.error('Failed to copy message content: ', err);
      toast.add({
        title: 'Failed to copy',
        description: 'Could not copy content to clipboard.',
        color: 'error',
        icon: 'i-heroicons-x-circle',
        duration: 2000,
      });
    }
  };

  const handleReaction = async (message: Message, reaction: 'thumbs_up' | 'thumbs_down') => {
    if (!message.id) return;

    try {
      await toggleReaction(message, reaction);

      const toastDescription = reaction === 'thumbs_up' 
        ? "Thanks for your feedback!" 
        : "Thanks for helping us improve!";

      const color = reaction === 'thumbs_up' ? 'success' : 'warning';
      const icon = reaction === 'thumbs_up' ? 'i-heroicons-hand-thumb-up' : 'i-heroicons-hand-thumb-down';
      
      toast.add({
        title: 'Feedback Received',
        description: toastDescription,
        color,
        icon,
        duration: 2000,
      });

      useTrackEvent('chat_click_reaction', {
        event_category: 'engagement',
        event_label: reaction,
        dwight_response_id: message.id,
      });

    } catch (error) {
      console.error('Failed to save feedback: ', error);
    }
  };

  return {
    handleCopyMessage,
    handleReaction,
  };
}
