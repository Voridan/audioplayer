import * as d3 from 'd3';
import { IOptions } from '../interface';

export enum EventType {
  DRAG_CURSOR,
  DRAG_CURSOR_END,
}

type EventHandler<T> = (arg: T) => void;

class Drawer {
  private buffer: AudioBuffer;

  private parent: HTMLElement;

  private cursor: d3.Selection<SVGGElement, undefined, null, undefined> | null =
    null;

  private playbackPageScale: d3.ScaleLinear<number, number, never> | null =
    null;

  private playbackDurationScale: d3.ScaleLinear<number, number, never> | null =
    null;

  private cursorTopShift: number = 0;

  private currentCursorPosition: number = 0;

  private paddings: number = 15; // are set for container in css

  private leftBound: number;

  private rightBound: number;

  private eventHandlers;

  public animationId: number = -1;

  constructor(buffer: AudioBuffer, parent: HTMLElement) {
    this.buffer = buffer;
    this.parent = parent;
    this.leftBound = this.parent.getBoundingClientRect().left - this.paddings;
    this.rightBound = this.parent.getBoundingClientRect().right - this.paddings;
    this.eventHandlers = new Map<EventType, Array<EventHandler<unknown>>>();
  }

  private getTimeDomain() {
    const step = 30; // 30 seconds
    const steps = Math.ceil(this.buffer.duration / step);

    return [...new Array(steps)].map((_, index) => {
      const date = new Date(1970, 0, 1, 0, 0, 0, 0);
      date.setSeconds(index * step);

      let minutes = date.getMinutes().toString();
      if (minutes.length === 1) {
        minutes = `0${minutes}`;
      }

      let seconds = date.getSeconds().toString();
      if (seconds.length === 1) {
        seconds = `0${seconds}`;
      }

      return `${minutes}:${seconds}`;
    });
  }

  public initTimeLine = (
    svg: d3.Selection<SVGSVGElement, undefined, null, undefined>,
    options: IOptions
  ) => {
    const {
      margin = { top: 40, bottom: 60, left: 0, right: 0 },
      height = this.parent.clientHeight,
    } = options;

    this.cursorTopShift = margin.top;

    const dragHandler = d3
      .drag()
      .on('drag', (e) => this.dragCursor(e.x, this.cursorTopShift))
      .on('end', (e) => this.triangleDragEnded(e.x));

    this.playbackPageScale = d3
      .scaleLinear()
      .domain([0, this.buffer.duration])
      .range([this.leftBound, this.rightBound]);

    this.playbackDurationScale = d3
      .scaleLinear()
      .domain([this.leftBound, this.rightBound])
      .range([0, this.buffer.duration]);

    this.cursor = svg
      .append('g')
      .attr('class', 'cursor-group')
      .attr('cursor', 'pointer')
      .attr('height', height - margin.top - margin.bottom)
      .attr(
        'transform',
        `translate(${this.playbackPageScale(0)}, ${this.cursorTopShift})`
      )
      .call(dragHandler);

    this.cursor
      .append('rect')
      .attr('class', 'cursor')
      .attr('width', 3)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', 'red');

    this.cursor
      .append('path')
      .attr('class', 'triangle')
      .attr('d', 'M1.5 1.5 L1.5 12.5 L11.5 7 z')
      .attr('transform', `translate(9,-15) rotate(90)`)
      .attr('fill', 'red')
      .attr('stroke', 'red')
      .attr('stroke-width', '1');
  };

  private triangleDragEnded = (x: number) => {
    this.emit<number>(
      EventType.DRAG_CURSOR_END,
      this.playbackDurationScale!(x)
    );
  };

  public dragCursor = (x: number, y?: number) => {
    this.moveCursor(x, y, { drag: true, reset: false });
    this.emit(EventType.DRAG_CURSOR, this.playbackDurationScale!(x));
  };

  public moveCursor = (
    x: number,
    y?: number,
    options: { reset: boolean; drag: boolean } = { drag: false, reset: false }
  ) => {
    const { reset, drag } = options;

    if (reset) this.currentCursorPosition = this.leftBound + 1;
    else if (drag) this.currentCursorPosition = x;
    else this.currentCursorPosition += this.playbackPageScale!(x);

    if (
      this.cursor &&
      this.currentCursorPosition > this.leftBound &&
      this.currentCursorPosition < this.rightBound
    ) {
      this.cursor.attr(
        'transform',
        `translate(${this.currentCursorPosition}, ${y || this.cursorTopShift})`
      );
    }
  };

  public generateWaveform(
    audioData: number[],
    options: IOptions // need to describe interface
  ) {
    const {
      margin = { top: 0, bottom: 0, left: 0, right: 0 },
      height = this.parent.clientHeight,
      width = this.parent.clientWidth,
    } = options;

    const domain = d3.extent(audioData); // [min, max]

    const xScale = d3
      .scaleLinear()
      .domain([0, audioData.length - 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain(domain.map((i) => Number(i)))
      .range([margin.top, height - margin.bottom]);

    const svg = d3.create('svg');
    svg
      .style('width', this.parent.clientWidth)
      .style('height', this.parent.clientHeight)
      .style('display', 'block');

    svg // const grid = svg
      .append('g')
      .attr('stroke-width', 0.5)
      .attr('stroke', '#D6E5D6')
      .call((g) =>
        g
          .append('g')
          .selectAll('line')
          .data(xScale.ticks())
          .join('line')
          .attr('x1', (d: d3.NumberValue) => 0.5 + xScale(d))
          .attr('x2', (d: d3.NumberValue) => 0.5 + xScale(d))
          .attr('y1', 0)
          .attr('y2', this.parent.clientHeight)
      )
      .call((g) =>
        g
          .append('g')
          .selectAll('line')
          .data(yScale.ticks())
          .join('line')
          .attr('y1', (d: d3.NumberValue) => yScale(d))
          .attr('y2', (d: d3.NumberValue) => yScale(d))
          .attr('x1', 0)
          .attr('x2', this.parent.clientWidth)
      );

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'rgba(255, 255, 255, 0)');

    // const g = svg
    //   .append('g')
    //   .attr('transform', `translate(0, ${height / 2})`)
    //   .attr('fill', '#03A300');

    // const band = (width - margin.left - margin.right) / audioData.length; // audiotrack length

    // g.selectAll('rect')
    //   .data(audioData)
    //   .join('rect')
    //   .attr('fill', '#03A300')
    //   .attr('height', (d) => yScale(d)) // from data value into page scales
    //   .attr('width', () => band * padding)
    //   .attr('x', (_, i) => xScale(i))
    //   .attr('y', (d) => -yScale(d) / 2)
    //   .attr('rx', band / 2)
    //   .attr('ry', band / 2);

    const bands = this.getTimeDomain();

    const bandScale = d3
      .scaleBand()
      .domain(bands)
      .range([margin.top, this.parent.clientWidth]);

    svg
      .append('g')
      // eslint-disable-next-line @typescript-eslint/no-shadow
      .call((g) => g.select('.domain').remove())
      .attr('stroke-width', 0)
      .style('color', '#95A17D')
      .style('font-size', 11)
      .style('font-wight', 400)
      .call(d3.axisBottom(bandScale.copy()));

    return svg;
  }

  public clearData() {
    const rawData = this.buffer.getChannelData(0); // We only need to work with one channel of data
    // https://www.izotope.com/en/learn/digital-audio-basics-sample-rate-and-bit-depth.html#:~:text=Sample%20rate%20is%20the%20number,frequencies%20captured%20in%20digital%20audio.
    const samples = this.buffer.sampleRate; // Number of samples we want to have in our final data set
    const blockSize = Math.floor(rawData.length / samples); // the number of samples in each subdivision
    const filteredData = [];
    for (let i = 0; i < samples; i += 1) {
      const blockStart = blockSize * i; // the location of the first sample in the block
      let sum = 0;
      for (let j = 0; j < blockSize; j += 1) {
        sum += Math.abs(rawData[blockStart + j]); // find the sum of all the samples in the block
      }
      filteredData.push(sum / blockSize); // divide the sum by the block size to get the average
    }
    const multiplier = Math.max(...filteredData) ** -1;
    return filteredData.map((n) => n * multiplier); // scaling data to [0, 1]
  }

  public initBars(analyser: AnalyserNode) {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const width = this.parent.clientWidth;
    const height = this.parent.clientHeight;
    const xScale = d3
      .scaleLinear()
      .domain([0, bufferLength])
      .range([0, width / 2]);
    const svg = d3.select(this.parent).select('svg');
    const barWidth = width / 2 / bufferLength;

    svg
      .selectAll('.bar')
      .data(dataArray)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (_, i) => xScale(i) + width / 2)
      .attr('width', barWidth)
      .attr('y', height)
      .attr('height', 0);

    svg
      .selectAll('.mirrored-bar')
      .data(dataArray)
      .enter()
      .append('rect')
      .attr('class', 'mirrored-bar')
      .attr('x', (_, i) => width / 2 - xScale(i))
      .attr('width', barWidth)
      .attr('y', height)
      .attr('height', 0);
  }

  public animateAudio = (analyser: AnalyserNode) => {
    this.initBars(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const height = this.parent.clientHeight;
    const offset = +height * 0.2;
    const bars = d3.select(this.parent).select('svg').selectAll('.bar');
    const mirroredBars = d3
      .select(this.parent)
      .select('svg')
      .selectAll('.mirrored-bar');

    const yScale = d3.scaleLinear().domain([0, 255]).range([height, 0]);
    const colorScale = d3
      .scaleSequential(d3.interpolateViridis)
      .domain([0, bufferLength]);
    if (this.animationId > 0) cancelAnimationFrame(this.animationId);
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      analyser.getByteFrequencyData(dataArray);

      bars
        .data(dataArray)
        .attr('y', (d) => yScale(d) + offset)
        .attr('height', (d) => height - yScale(d))
        .attr('fill', (_, i) => colorScale(i));
      mirroredBars
        .data(dataArray)
        .attr('y', (d) => yScale(d) + offset)
        .attr('height', (d) => height - yScale(d))
        .attr('fill', (_, i) => colorScale(i));
    };

    animate();
    return this.animationId;
  };

  public clearBars() {
    const svg = d3.select(this.parent).select('svg');
    svg.selectAll('.bar').remove();
    svg.selectAll('.mirrored-bar').remove();
  }

  public init() {
    return new Promise((res) => {
      this.parent.innerHTML = '';
      const audioData = this.clearData();
      const node = this.generateWaveform(audioData, {});
      this.initTimeLine(node, {
        margin: { top: 40, bottom: 40, left: 0, right: 0 },
      });
      this.parent.appendChild(node.node() as Element);
      res(undefined);
    });
  }

  public subscribe<T>(eventType: EventType, handler: EventHandler<T>): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
  }

  private emit<T>(eventType: EventType, arg: T): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        handler(arg);
      });
    }
  }
}

export default Drawer;
