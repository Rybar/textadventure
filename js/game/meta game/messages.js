export function createMetaGameContent() {
  return {
    startupMessageId: 'startupObserver',
    messages: {
      startupObserver: {
        id: 'startupObserver',
        text: 'someone is watching',
        options: {
          holdDuration: 1800,
          revealChance: 0.055,
          clearFraction: 0.045,
          clearFrameLength: 42,
        },
      },
    },
  };
}

export default createMetaGameContent;