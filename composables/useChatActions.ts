import type { Message } from '~/models/chat';
import { useClipboard } from '@vueuse/core'


export function useChatActions() {
  const toast = useToast();
  const clipboard = useClipboard();

  const handleCopyMessage = (message: Message) => {
    const contentToCopy = message.content;

    if (navigator.clipboard && contentToCopy) {
      try {
        clipboard.copy(message.content)
        toast.add({
          title: "Copied to clipboard",
          description: "Message content copied to clipboard",
          color: "success",
          icon: "i-heroicons-check-circle",
          duration: 2000,
        });
      } catch (err) {
        console.error("Failed to copy message content: ", err);
        toast.add({
          title: "Failed to copy to clipboard",
          description: "Message content could not be copied to clipboard",
          color: "error",
          icon: "i-heroicons-x-circle",
          duration: 2000,
        });
      }
    } else {
      toast.add({
        title: "Clipboard API not available",
        description: "Clipboard API not available or no content to copy.",
        color: "error",
        icon: "i-heroicons-x-circle",
        duration: 2000,
      });
    }
    useTrackEvent("chat_click_copy", {
      event_category: "engagement",
      event_label: "copy",
      non_interaction: false,
      message_id: message.id,
    });
  };

  const handleThumbsUp = async (message: Message) => {
    toast.add({
      title: "Feedback received!",
      description: "Thanks for your feedback.",
      color: "success",
      icon: "i-heroicons-check-circle",
      duration: 2000,
    });
    useTrackEvent("chat_action_feedback_positive", {
      event_category: "engagement",
      event_label: "positive_feedback",
      message_id: message.id,
      non_interaction: false,
    });
    // TODO: Optionally, send feedback to a backend or update message state
  };

  const handleThumbsDown = async (message: Message) => {
    toast.add({
      title: "Feedback received!",
      description: "Thanks for helping us improve.",
      color: "warning", 
      icon: "i-heroicons-exclamation-circle",
      duration: 2000
    });
    useTrackEvent("chat_action_feedback_negative", {
      event_category: "engagement",
      event_label: "negative_feedback",
      message_id: message.id,
      non_interaction: false,
    });
    // TODO: Optionally, allow user to provide more details or send feedback to a backend
  };

  return {
    handleCopyMessage,
    handleThumbsUp,
    handleThumbsDown,
  };
}
