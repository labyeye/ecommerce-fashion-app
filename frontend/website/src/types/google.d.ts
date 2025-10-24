// Google Sign-In types
interface Google {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      renderButton: (
        element: HTMLElement,
        config: {
          theme?: 'outline' | 'filled_blue' | 'filled_black';
          size?: 'large' | 'medium' | 'small';
          text?: string;
          shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        }
      ) => void;
      prompt: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: Google;
  }
}

export {};
