class NoteSelector {
  constructor(parentNode, notes) {
    this.noteSelector = document.createElement('select');
    notes.map(note => {
      let option = document.createElement('option');
      option.value = note;
      option.appendChild(document.createTextNode(note));
      this.noteSelector.appendChild(option);
    });

    this.noteSelector.id = 'musicbox-note-selector';

    parentNode.appendChild(this.noteSelector);
  }

  get selectedNote() {
    return this.noteSelector.options[this.noteSelector.selectedIndex].value;
  }
}

class PlayButton {
  get isPlaying() {
    return Tone.Transport.state === 'started';
  }

  constructor(parentNode) {
    this.playButton = document.createElement('button');
    this.playButton.textContent = this.isPlaying ? 'Stop' : 'Play';

    this.playButton.addEventListener('click', () => {
      if (Tone.context.state !== 'running') {
        Tone.context.resume();
      }
      Tone.Transport.toggle();
      this.playButton.textContent = this.isPlaying ? 'Stop' : 'Play';
    });

    this.playButton.id = 'musicbox-play-button';

    parentNode.appendChild(this.playButton);
  }
}

class Sequencer {
  get notes() {
    return this.sequenceContainer.querySelectorAll('.note');
  }

  noteAt(x, y) {
    return this.notes[x + this.measures * this.notesPerMeasure * y];
  }

  noteEnabled(x, y) {
    return this.noteAt(x, y).getAttribute('data-state') === 'on';
  }

  noteEnabledAtColumn(x) {
    let note = [];
    for (let y = 0; y < this.octaves * this.notesPerOctave; y += 1) {
      if (this.noteEnabled(x, y)) {
        note.push(y);
      }
    }
    return note.length === 0 ? null : note;
  }

  highlightColumn(column) {
    for (let y = 0; y < this.octaves * this.notesPerOctave; y += 1) {
      this.noteAt(this.currentColumn, y).classList.remove('column-on');
    }
    this.currentColumn = column;
    for (let y = 0; y < this.octaves * this.notesPerOctave; y += 1) {
      this.noteAt(this.currentColumn, y).classList.add('column-on');
    }
  }

  get sequence() {
    let sequence = [];
    for (let x = 0; x < this.measures * this.notesPerMeasure; x += 1) {
      sequence.push(this.noteEnabledAtColumn(x));
    }
    return sequence;
  }

  clearColumn(x) {
    for (let y = 0; y < this.octaves * this.notesPerOctave; y += 1) {
      const note = this.noteAt(x, y);
      note.setAttribute('data-state', 'off');
      note.classList.remove('note-on');
    }
  }

  constructor(parentNode, measures, octaves) {
    this.sequenceContainer = document.createElement('div');
    this.measures = measures;
    this.octaves = octaves;
    this.notesPerOctave = 5;
    this.notesPerMeasure = 16;
    this.currentColumn = 0;
    this.mouseMode = 'none';

    this.sequenceContainer.id = 'musicbox-sequencer';

    let self = this;
    for (let y = 0; y < this.octaves * this.notesPerOctave; y += 1) {
      let noteRow = document.createElement('div');
      noteRow.classList.add('note-row');
      for (let x = 0; x < this.measures * this.notesPerMeasure; x += 1) {
        let note = document.createElement('div');
        note.classList.add('note');
        note.setAttribute('data-state', 'off');
        note.setAttribute('data-col', x);

        const preventDefault = event => {
          event.preventDefault();
        };

        this.sequenceContainer.addEventListener('mousedown', preventDefault);
        this.sequenceContainer.addEventListener('touchstart', preventDefault);

        const pressListener = event => {
          if (note.getAttribute('data-state') === 'off') {
            note.classList.add('note-on');
            note.setAttribute('data-state', 'on');
            self.mouseMode = 'on';
          } else {
            note.classList.remove('note-on');
            note.setAttribute('data-state', 'off');
            self.mouseMode = 'off';
          }

          this.sequenceContainer.dispatchEvent(new Event('change'));
        };

        const releaseListener = event => {
          self.mouseMode = 'none';
        };

        const moveListener = event => {
          if (event.type === 'touchmove') {
            let newElement = document.elementFromPoint(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
            if (!newElement.classList.contains('note')) return;
            note = newElement;
          }
          if (
            self.mouseMode === 'none' ||
            self.mouseMode === note.getAttribute('data-state')
          )
            return;

          if (self.mouseMode === 'on') {
            note.classList.add('note-on');
            note.setAttribute('data-state', 'on');
            self.mouseMode = 'on';
          } else if (self.mouseMode === 'off') {
            note.classList.remove('note-on');
            note.setAttribute('data-state', 'off');
            self.mouseMode = 'off';
          }

          this.sequenceContainer.dispatchEvent(new Event('change'));
        };

        document.body.addEventListener('mouseup', releaseListener);
        document.body.addEventListener('touchstop', releaseListener);
        note.addEventListener('mousedown', pressListener);
        note.addEventListener('touchstart', pressListener);
        note.addEventListener('mousemove', moveListener);
        note.addEventListener('touchmove', moveListener);

        noteRow.appendChild(note);
      }
      this.sequenceContainer.appendChild(noteRow);
    }
    parentNode.appendChild(this.sequenceContainer);
  }
}

class MusicBoxUI {
  constructor(options) {
    this.sequencer = options.sequencer;
    this.noteSelector = options.noteSelector;
    this.playButton = options.playButton;

    let uiContainer = document.createElement('div');
    let controlContainer = document.createElement('div');

    uiContainer.id = 'musicbox-ui-container';
    controlContainer.id = 'musicbox-control-container';

    controlContainer.appendChild(this.noteSelector.noteSelector);
    controlContainer.appendChild(this.playButton.playButton);
    uiContainer.appendChild(controlContainer);

    uiContainer.appendChild(this.sequencer.sequenceContainer);
    document.body.appendChild(uiContainer);
  }
}

class MusicBox {
  static pentatonicScale(baseHertz, octaves) {
    octaves = typeof octaves === 'undefined' ? 1 : octaves;

    let pentatonicScale = [];

    for (let octave = 1; octave <= octaves; octave += 1) {
      pentatonicScale = pentatonicScale.concat([
        baseHertz * octave,
        ((baseHertz * 9) / 8) * octave,
        ((baseHertz * 81) / 64) * octave,
        ((baseHertz * 3) / 2) * octave,
        ((baseHertz * 27) / 16) * octave
      ]);
    }

    return pentatonicScale;
  }

  static randomPentatonic(baseHertz, octaves) {
    let notes = MusicBox.pentatonicScale(baseHertz, octaves);
    return notes[Math.floor(Math.random() * notes.length)];
  }

  get sequence() {
    const baseHertz = Tone.Frequency(this.scaleSelector.selectedNote);
    const pentatonicScale = MusicBox.pentatonicScale(
      baseHertz,
      this.sequencer.octaves
    );

    return this.sequencer.sequence.map(chord =>
      chord === null
        ? null
        : chord.map(note => pentatonicScale[pentatonicScale.length - 1 - note])
    );
  }

  constructor(instrument, userInterface) {
    this.instrument = instrument;
    this.scaleSelector = userInterface.noteSelector;
    this.sequencer = userInterface.sequencer;

    const self = this;

    this.toneSequence = new Tone.Sequence(
      function(time, column) {
        if (self.sequence[column] !== null) {
          instrument.triggerAttackRelease(
            self.sequence[column],
            `${self.sequencer.notesPerMeasure}n`,
            time,
            Math.random() * 0.5 + 0.5
          );
        }
        Tone.Draw.schedule(() => {
          self.sequencer.highlightColumn(column);
        }, time);
      },
      Array.from(Array(this.sequencer.notesPerMeasure * this.sequencer.measures).keys()),
      `${this.sequencer.notesPerMeasure}n`
    );
    this.toneSequence.start();
  }
}

const MEASURES = 1;
const OCTAVES = 2;
const NOTES = [
  'C2',
  'Db2',
  'D2',
  'E2',
  'Eb2',
  'F2',
  'Gb2',
  'G2',
  'Ab2',
  'A2',
  'Bb2',
  'B2'
];

const body = document.body;
const userInterfaceElements = {
  noteSelector: new NoteSelector(body, NOTES),
  playButton: new PlayButton(body),
  sequencer: new Sequencer(body, MEASURES, OCTAVES)
};

const instrument = new Tone.PolySynth(OCTAVES * 5).toMaster();
const musicBoxUI = new MusicBoxUI(userInterfaceElements);

new MusicBox(instrument, musicBoxUI);
