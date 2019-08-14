class NoteSelector {
  constructor(parentNode, notes) {
    this.noteSelector = document.createElement('select');
    this.noteSelector.classList.add('musicbox-ui-control');
    this.noteSelector.classList.add('musicbox-ui-note-selector');
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
    return Tone.Frequency(
      this.noteSelector.options[this.noteSelector.selectedIndex].value
    );
  }
}

class PlayButton {
  get isPlaying() {
    return Tone.Transport.state === 'started';
  }

  constructor(parentNode) {
    this.playButton = document.createElement('div');
    this.playButton.classList.add('musicbox-ui-control');
    this.playButton.classList.add('musicbox-ui-play-button');
    this.playButton.textContent = '▶';

    this.playButton.addEventListener('click', () => {
      if (Tone.context.state !== 'running') {
        Tone.context.resume();
      }
      Tone.Transport.toggle();
      this.playButton.textContent = this.isPlaying ? '◼' : '▶';
    });

    this.playButton.id = 'musicbox-play-button';

    parentNode.appendChild(this.playButton);
  }
}

class Sequencer {
  get notes() {
    return this.sequencerContainer.querySelectorAll('.musicbox-ui-note');
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
      this.noteAt(this.currentColumn, y).classList.remove(
        'musicbox-ui-column-on'
      );
    }
    this.currentColumn = column;
    for (let y = 0; y < this.octaves * this.notesPerOctave; y += 1) {
      this.noteAt(this.currentColumn, y).classList.add('musicbox-ui-column-on');
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
      note.classList.remove('musicbox-ui-note-on');
    }
  }

  constructor(parentNode, measures, octaves) {
    this.sequencerContainer = document.createElement('div');
    this.measures = measures;
    this.octaves = octaves;
    this.notesPerOctave = 5;
    this.notesPerMeasure = 16;
    this.currentColumn = 0;
    this.mouseMode = 'none';

    this.sequencerContainer.classList.add('musicbox-ui-sequencer');

    for (let y = 0; y < this.octaves * this.notesPerOctave; y += 1) {
      let noteRow = document.createElement('div');
      noteRow.classList.add('musicbox-ui-note-row');
      for (let x = 0; x < this.measures * this.notesPerMeasure; x += 1) {
        let note = document.createElement('div');
        note.classList.add('musicbox-ui-note');
        note.setAttribute('data-state', 'off');
        note.setAttribute('data-col', x);

        const sequencerInteraction = event => {
          event.preventDefault();
          if (this.mouseMode === 'none') this.mouseMode = 'on';
        };

        this.sequencerContainer.addEventListener(
          'mousedown',
          sequencerInteraction
        );
        this.sequencerContainer.addEventListener(
          'touchstart',
          sequencerInteraction
        );

        const pressListener = event => {
          if (note.getAttribute('data-state') === 'off') {
            note.classList.add('musicbox-ui-note-on');
            note.setAttribute('data-state', 'on');
            this.mouseMode = 'on';
          } else {
            note.classList.remove('musicbox-ui-note-on');
            note.setAttribute('data-state', 'off');
            this.mouseMode = 'off';
          }

          this.sequencerContainer.dispatchEvent(new Event('change'));
        };

        const releaseListener = event => {
          this.mouseMode = 'none';
        };

        const moveListener = event => {
          if (event.type === 'touchmove') {
            let newElement = document.elementFromPoint(
              event.changedTouches[0].clientX,
              event.changedTouches[0].clientY
            );
            if (!newElement.classList.contains('musicbox-ui-note')) return;
            note = newElement;
          }

          if (
            this.mouseMode === 'none' ||
            this.mouseMode === note.getAttribute('data-state')
          )
            return;

          if (this.mouseMode === 'on') {
            note.classList.add('musicbox-ui-note-on');
            note.setAttribute('data-state', 'on');
            this.mouseMode = 'on';
          } else if (this.mouseMode === 'off') {
            note.classList.remove('musicbox-ui-note-on');
            note.setAttribute('data-state', 'off');
            this.mouseMode = 'off';
          }

          this.sequencerContainer.dispatchEvent(new Event('change'));
        };

        document.body.addEventListener('mouseup', releaseListener);
        document.body.addEventListener('touchstop', releaseListener);
        note.addEventListener('mousedown', pressListener);
        note.addEventListener('touchstart', pressListener);
        note.addEventListener('mousemove', moveListener);
        note.addEventListener('touchmove', moveListener);

        noteRow.appendChild(note);
      }
      this.sequencerContainer.appendChild(noteRow);
    }
    parentNode.appendChild(this.sequencerContainer);

    this.highlightColumn(0);
    Tone.Transport.on('stop', () => {
      setTimeout(() => this.highlightColumn(0), 100);
    });
  }
}

class MusicBoxUI {
  constructor(options) {
    this.sequencer = options.sequencer;
    this.noteSelector = options.noteSelector;
    this.playButton = options.playButton;

    this.uiContainer = document.createElement('div');
    this.controlContainer = document.createElement('div');

    this.uiContainer.id = 'musicbox-ui-container';
    this.controlContainer.id = 'musicbox-control-container';

    this.controlContainer.appendChild(this.playButton.playButton);
    this.controlContainer.appendChild(this.noteSelector.noteSelector);
    this.uiContainer.appendChild(this.controlContainer);

    this.uiContainer.appendChild(this.sequencer.sequencerContainer);
    document.body.appendChild(this.uiContainer);
  }
}

class MusicBox {
  static majorPentatonicScaleFrom(note, octaves) {
    return Array.from(new Array(octaves).keys()).reduce(
      (accumulator, octave) => {
        return accumulator.concat(
          note.transpose(12 * octave).harmonize([0, 2, 4, 7, 9])
        );
      },
      []
    );
  }

  get sequence() {
    const scale = this.scale;
    return this.sequencer.sequence.map(chord =>
      chord === null ? null : chord.map(note => scale[scale.length - 1 - note])
    );
  }

  constructor(instrument, userInterface) {
    this.instrument = instrument;
    this.scaleSelector = userInterface.noteSelector;
    this.sequencer = userInterface.sequencer;
    this.scale = MusicBox.majorPentatonicScaleFrom(
      this.scaleSelector.selectedNote,
      this.sequencer.octaves
    );

    this.sequenceArray = Array.from(
      Array(this.sequencer.notesPerMeasure * this.sequencer.measures).keys()
    );

    this.toneSequence = new Tone.Sequence(
      function(time, column) {
        if (this.sequence[column] !== null) {
          instrument.triggerAttackRelease(
            this.sequence[column],
            `${this.sequencer.notesPerMeasure << 1}n`,
            time
          );
        }
        Tone.Draw.schedule(() => {
          this.sequencer.highlightColumn(column);
        }, time);
      }.bind(this),
      this.sequenceArray,
      `${this.sequencer.notesPerMeasure}n`
    ).start(0);

    this.scaleSelector.noteSelector.addEventListener('change', () => {
      this.scale = MusicBox.majorPentatonicScaleFrom(
        this.scaleSelector.selectedNote,
        this.sequencer.octaves
      );
    });
  }
}

const MEASURES = 1;
const OCTAVES = 3;
const NOTES = [
  'C3',
  'Db3',
  'D3',
  'E3',
  'Eb3',
  'F3',
  'Gb3',
  'G3',
  'Ab3',
  'A3',
  'Bb3',
  'B3'
];

const body = document.body;
const userInterfaceElements = {
  noteSelector: new NoteSelector(body, NOTES),
  playButton: new PlayButton(body),
  sequencer: new Sequencer(body, MEASURES, OCTAVES)
};

const instrument = new Tone.PolySynth(OCTAVES * 5).chain(new Tone.Limiter(-32), Tone.Master);
const musicBoxUI = new MusicBoxUI(userInterfaceElements);

new MusicBox(instrument, musicBoxUI);
