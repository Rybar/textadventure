export class Transcript {
  constructor() {
    this.entries = [];
  }

  clear() {
    this.entries = [];
  }

  recordSystem(text) {
    this.entries.push({
      type: 'system',
      text,
    });
  }

  recordTurn(command, response) {
    this.entries.push({
      type: 'turn',
      command,
      response,
    });
  }

  getLatestPrintableEntry() {
    const latestEntry = this.entries.at(-1);
    if (!latestEntry) {
      return '';
    }

    if (latestEntry.type === 'system') {
      return latestEntry.text;
    }

    return `> ${latestEntry.command}\n${latestEntry.response}`;
  }
}

export default Transcript;