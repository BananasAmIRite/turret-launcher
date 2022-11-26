import { ReadlineParser, SerialPort, SerialPortMock } from 'serialport';

export default class Launcher {
  private parser: ReadlineParser;
  private data?: (data: Object) => void;
  public constructor(private port: SerialPortMock) {
    // TODO: change to SerialPort
    this.parser = new ReadlineParser();
    port.pipe(this.parser);

    this.parser.on('data', (data) => {
      this.data?.(JSON.parse(data));
    });
  }

  public onData(f: (data: Object) => void) {
    this.data = f;
  }

  public rotateX(rot: number, rotateTo: boolean) {
    this.port.write(JSON.stringify({ action: 'rotateX', payload: { rotation: rot, rotateTo } }));
  }

  public rotateY(rot: number, rotateTo: boolean) {
    this.port.write(JSON.stringify({ action: 'rotateY', payload: { rotation: rot, rotateTo } }));
  }

  public shoot() {
    this.port.write(JSON.stringify({ action: 'shoot' }));
  }
}
