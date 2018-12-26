import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {Helmet} from 'react-helmet';


class Share extends React.Component {
  render() {
    let className = "share"
    if(!this.props.lastSeen || 
       new Date().getTime() - this.props.lastSeen > 2000) 
        className += " shareBroken"
    return <div className={className}>Opponent link: {this.props.src}</div>
  }
}

class WallIndicator extends React.Component {
  render() {
    let row = [];
    for (let i = 0; i < this.props.wallsLeft; i++) {
      const className =
        "wallIndicator player" + (this.props.isPlayer1 ? "1" : "2");
      row.push(
        <td key={i} className={className}>
          {" "}
        </td>
      );
    }
    return (
      <table>
        <tbody>
          <tr>{row}</tr>
        </tbody>
      </table>
    );
  }
}

class Cell extends React.Component {
  render() {
    let inner;
    if (this.props.isPlayer1 || this.props.isPlayer2) {
      const player = this.props.isPlayer1 ? "1" : "2";
      inner = <div className={`cellFill player player${player}`} />;
    } else if (this.props.isMove) {
      inner = (
        <div className="moveCont cellFill">
          <div className={`move player${this.props.toMove}`} />
        </div>
      );
    } else {
      inner = <div className="cellFill" />;
    }
    return (
      <td
        className="cell"
        onClick={this.props.onClick}
        onMouseMove={this.props.onMouseMove}
      >
        {inner}
      </td>
    );
  }
}

class Wall extends React.Component {
  render() {
    let className = "gap";
    if (this.props.isWall) className += " wall";
    if (this.props.isHover)
      className += this.props.canPlaceWall ? " hoverGood" : " hoverBad";
    return (
      <td
        onClick={this.props.onClick}
        onMouseMove={this.props.onMouseMove}
        className={className}
      />
    );
  }
}

class WallIntersect extends React.Component {
  render() {
    let className = "gap";
    if (this.props.isWall) className += " wall";
    if (this.props.isHover)
      className += this.props.canPlaceWall ? " hoverGood" : " hoverBad";
    return <td onClick={this.props.onClick} className={className} />;
  }
}

class Winner extends React.Component {
  render() {
    const className =
      "player " + (this.props.isPlayer1 ? "player1" : "player2");
    return (
      <div className="winner">
        <div>Winner: </div>
        <div className={className} />
      </div>
    );
  }
}

class Board extends React.Component {
  createTable = () => {
    let table = [];
    const hw = this.props.hoverWall;
    const isHorizHover = (x, y) =>
      hw && hw.h && (x === hw.x || x === hw.x + 1) && y === hw.y;
    const isVertHover = (x, y) =>
      hw && !hw.h && (y === hw.y || y === hw.y + 1) && x === hw.x;
    const isInterHover = (x, y) => hw && y === hw.y && x === hw.x;

    for (let y = 0; y < this.props.height; y++) {
      let currentRow = [];
      let nextRow = [];
      for (let x = 0; x < this.props.width; x++) {
        let key = 4 * (x + this.props.width * y);
        currentRow.push(
          <Cell
            key={key}
            onClick={() => this.props.onCellClick(x, y)}
            isPlayer1={x === this.props.player1.x && y === this.props.player1.y}
            isPlayer2={x === this.props.player2.x && y === this.props.player2.y}
            onMouseMove={this.props.onWallHoverClear}
            isMove={this.props.currentMoves.reduce(
              (acc, now) => acc || (now.x === x && now.y === y),
              false
            )}
            toMove={this.props.toMove}
          />
        );
        if (x < this.props.width - 1) {
          currentRow.push(
            <Wall
              key={key + 1}
              isWall={this.props.isVertWallAt(x, y)}
              onMouseMove={() => this.props.onWallHover(false, x, y)}
              isHover={isVertHover(x, y)}
              canPlaceWall={hw ? hw.valid : null}
              onClick={() => this.props.onWallClick(false, x, y)}
            />
          );
        }
        if (y < this.props.height - 1) {
          nextRow.push(
            <Wall
              key={key + 3}
              isWall={this.props.isHorizWallAt(x, y)}
              onMouseMove={() => this.props.onWallHover(true, x, y)}
              isHover={isHorizHover(x, y)}
              canPlaceWall={hw ? hw.valid : null}
              onClick={() => this.props.onWallClick(true, x, y)}
            />
          );
          if (x < this.props.width - 1) {
            nextRow.push(
              <WallIntersect
                key={key + 2}
                canPlaceWall={hw ? hw.valid : null}
                isWall={this.props.isIntersectWallAt(x, y)}
                isHover={isInterHover(x, y)}
              />
            );
          }
        }
      }
      table.push(<tr key={y * 2}>{currentRow}</tr>);
      if (y < this.props.height - 1) {
        table.push(<tr key={y * 2 + 1}>{nextRow}</tr>);
      }
    }
    return table;
  };

  render() {
    return (
      <table>
        <tbody>{this.createTable()}</tbody>
      </table>
    );
  }
}

class History extends React.Component {
  render() {
    let items = [];

    const renderNum = i => {
      let className = "state";
      if (i === this.props.current) className += " currentState";
      const content = i === 0 ? "Start" : "Move " + i;
      items.push(
        <span
          key={i}
          className={className}
          onClick={() => this.props.onStepNumChange(i)}
        >
          {content}
        </span>
      );
    };

    renderNum(0);
    if (this.props.current > 2)
      items.push(
        <span key="gap1" className="spacer">
          ...
        </span>
      );
    for (
      let i = Math.max(this.props.current - 1, 1);
      i < Math.min(this.props.current + 2, this.props.max);
      i++
    )
      renderNum(i);
    if (this.props.max > this.props.current + 3)
      items.push(
        <span key="gap2" className="spacer">
          ...
        </span>
      );
    if (this.props.max > this.props.current + 2) renderNum(this.props.max - 1);

    return <div className="history">{items}</div>;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getResetState();
    this.URL_BASE = "https://ci240.user.srcf.net/quoridor";
    this.state.gameId = parseInt(window.location.hash.substring(1));
    if(!this.state.gameId) {
      this.state.gameId = Math.floor(Math.random() * 1000000000);
      window.location.hash = this.state.gameId;
    }
  }

  getResetState() {
    return {
      history: [
        {
          walls: new Set(),
          player1: {
            x: ~~(this.props.width / 2),
            y: this.props.height - 1,
            remainingWalls: 10
          },
          player2: {
            x: ~~(this.props.width / 2),
            y: 0,
            remainingWalls: 10
          }
        }
      ],
      stepNumber: 0
    };
  }

  componentDidMount() {
    // Poll for changes
    this.timer = setInterval(() => this.pollChanges(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }


  upload() {
    const url = `${this.URL_BASE}/upload.py`;

    const moves = [];

    for (let i = 1; i < this.state.history.length; i++) {
      let last = this.state.history[i - 1];
      let current = this.state.history[i];
      if (last.walls.size + 1 === current.walls.size) {
        let newWall = [...current.walls].filter(x => !last.walls.has(x))[0];
        let [h, x, y] = this.intToWallCoords(newWall);
        moves.push({
          type: "wall",
          data: {
            position: { x: x, y: y },
            h: h
          }
        });
      } else if (
        last.player1.x !== current.player1.x ||
        last.player1.y !== current.player1.y
      ) {
        moves.push({
          type: "player",
          data: {
            position: { x: current.player1.x, y: current.player1.y }
          }
        });
      } else if (
        last.player2.x !== current.player2.x ||
        last.player2.y !== current.player2.y
      ) {
        moves.push({
          type: "player",
          data: {
            position: { x: current.player2.x, y: current.player2.y }
          }
        });
      } else {
        console.error("Unrecognised move");
      }
    }

    const data = {
      gameId: this.state.gameId,
      moves: moves
    };

    fetch(url, {
      method: "POST",
      // mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      // redirect: "follow",
      body: JSON.stringify(data)
    })
      .then(r => this.jsonResponseOrError(r))
      .then(jsonObj => {
        if(!('error' in jsonObj) && 'latest' in jsonObj){
          if(this.latest < jsonObj.latest) {
            this.latest = jsonObj.latest;
          }
        } else if('error' in jsonObj) {
          console.error("Server error: " + jsonObj.error);
        } else {
          console.error("Unexpected response:", jsonObj);
        }
      }).catch(error => console.log(error));
  }

  jsonResponseOrError(response) {
    if(!response.ok) {
      debugger;
      throw Error(response.statusText, response)
    } else {
      this.setState({
        lastSeen: new Date().getTime()
      });
      return response.json();
    }
  }

  pollChanges() {
    const url = `${this.URL_BASE}/get.py?gameId=${this.state.gameId}` ;
    fetch(url)
      .then(r => this.jsonResponseOrError(r))
      .then(jsonObj => {
        if (!('error' in jsonObj) && 'num' in jsonObj && 'moves' in jsonObj) {
          if(this.latest >= jsonObj.num) return;
          this.latest = jsonObj.num;
          let moves = jsonObj.moves;
          this.setState(this.getResetState());
          moves.forEach(m => {
            if (m.type === "player")
              this.performPlayerMove(m.data.position.x, m.data.position.y);
            else if (m.type === "wall")
              this.performWallMove(
                m.data.h,
                m.data.position.x,
                m.data.position.y
              );
          });
        } else if('error' in jsonObj) {
          console.error("Server error: " + jsonObj.error);
        } else {
          console.error("Unexpected response:", jsonObj)
        }
      }).catch(error => console.error(error));
  }

  isPlayer1Turn(num) {
    num = num || this.state.stepNumber;
    return num % 2 === 0;
  }

  // Can't put [x, y] in set so need integer encoding
  wallCoordsToInt(horizontal, x, y) {
    const [w, h] = [this.props.width, this.props.height];
    if (x < 0 || x >= w || y < 0 || y >= h)
      throw new Error(`Wrong (x, y): (${x}, ${y})`);
    return x + y * w + (horizontal ? 0 : w * h);
  }
  // Convert the otherway
  intToWallCoords(i) {
    const [w, h] = [this.props.width, this.props.height];
    if (i < 0 || i > 2 * w * h) throw new Error(`Wrong i: ${i}`);
    const [horizontal, flatPos] = [Math.floor(i / (w * h)) === 0, i % (w * h)];
    const [x, y] = [flatPos % w, Math.floor(flatPos / w)];
    return [horizontal, x, y];
  }

  isVertWallAt(x, y, walls) {
    if (x >= this.props.width - 1) throw new Error("Can't have vert wall here");
    walls = walls || this.state.history[this.state.stepNumber].walls;
    return (
      (y > 0 && walls.has(this.wallCoordsToInt(false, x, y - 1))) ||
      walls.has(this.wallCoordsToInt(false, x, y))
    );
  }

  isHorizWallAt(x, y, walls) {
    if (y >= this.props.height - 1)
      throw new Error("Can't have horiz wall here");
    walls = walls || this.state.history[this.state.stepNumber].walls;
    return (
      (x > 0 && walls.has(this.wallCoordsToInt(true, x - 1, y))) ||
      walls.has(this.wallCoordsToInt(true, x, y))
    );
  }

  isIntersectWallAt(x, y, walls) {
    if (x >= this.props.width - 1 || y >= this.props.height - 1)
      throw new Error("Can't have intersect wall here");
    walls = walls || this.state.history[this.state.stepNumber].walls;
    return (
      walls.has(this.wallCoordsToInt(false, x, y)) ||
      walls.has(this.wallCoordsToInt(true, x, y))
    );
  }

  /* BFS from a point returning whether we can meet a point
   * that satisfies success(x, y) */
  BFS(walls, fromX, fromY, success) {
    let queue = [[fromX, fromY]]; // to explore, current frontier
    let w = this.props.width;
    let serial = (x, y) => x + y * w;
    let seen = new Set();
    let addToQueue = (x, y) => {
      if (!seen.has(serial(x, y))) {
        queue.push([x, y]);
        seen.add(serial(x, y));
      }
    };
    while (queue.length !== 0) {
      let [x, y] = queue.shift();
      seen.add(serial(x, y));
      if (success(x, y)) return true;
      if (x > 0 && !this.isVertWallAt(x - 1, y, walls)) addToQueue(x - 1, y);
      if (x < this.props.width - 1 && !this.isVertWallAt(x, y, walls))
        addToQueue(x + 1, y);
      if (y > 0 && !this.isHorizWallAt(x, y - 1, walls)) addToQueue(x, y - 1);
      if (y < this.props.height - 1 && !this.isHorizWallAt(x, y, walls))
        addToQueue(x, y + 1);
    }
    return false;
  }

  canPlaceVertWall(x, y) {
    const current = this.state.history[this.state.stepNumber];
    // If not blocked by wall
    if (
      !this.isVertWallAt(x, y) &&
      !this.isVertWallAt(x, y + 1) &&
      !current.walls.has(this.wallCoordsToInt(true, x, y)) &&
      ((this.isPlayer1Turn() && current.player1.remainingWalls > 0) ||
        (!this.isPlayer1Turn() && current.player2.remainingWalls > 0))
    ) {
      const newWallInt = this.wallCoordsToInt(false, x, y);
      const testNewWalls = new Set(current.walls).add(newWallInt);
      // Check we can still return
      return (
        this.canP1Finish(testNewWalls, current.player1) &&
        this.canP2Finish(testNewWalls, current.player2)
      );
    }
    return false;
  }

  canP1Finish(walls, p1) {
    return this.BFS(walls, p1.x, p1.y, (x, y) => y === 0);
  }

  canP2Finish(walls, p2) {
    return this.BFS(walls, p2.x, p2.y, (x, y) => y === this.props.height - 1);
  }

  canPlaceHorizWall(x, y) {
    const current = this.state.history[this.state.stepNumber];
    // If not blocked by wall
    if (
      !this.isHorizWallAt(x, y) &&
      !this.isHorizWallAt(x + 1, y) &&
      !current.walls.has(this.wallCoordsToInt(false, x, y)) &&
      ((this.isPlayer1Turn() && current.player1.remainingWalls > 0) ||
        (!this.isPlayer1Turn() && current.player2.remainingWalls > 0))
    ) {
      const newWallInt = this.wallCoordsToInt(true, x, y);
      const testNewWalls = new Set(current.walls).add(newWallInt);
      // Check we can still return
      return (
        this.canP1Finish(testNewWalls, current.player1) &&
        this.canP2Finish(testNewWalls, current.player2)
      );
    }
    return false;
  }

  // Called when we hover over a wall at a given position
  handleWallHover(horizontal, x, y) {
    this.setState((state, props) => {
      let [aimX, aimY] = this.clickToWallCoords(horizontal, x, y);
      if (
        !state.hoverWall ||
        state.hoverWall.x !== x ||
        state.hoverWall.y !== y // If this is a new update .
      ) {
        return {
          hoverWall: {
            x: aimX,
            y: aimY,
            h: horizontal,
            valid:
              (horizontal && this.canPlaceHorizWall(aimX, aimY)) ||
              (!horizontal && this.canPlaceVertWall(aimX, aimY))
          }
        };
      } else {
        return {};
      }
    });
  }

  handleWallHoverClear() {
    this.setState({ hoverWall: null });
  }

  clickToWallCoords(hor, x, y, w, h) {
    w = w || this.props.width;
    h = h || this.props.height;
    return [hor && x >= w - 1 ? x - 1 : x, !hor && y >= h - 1 ? y - 1 : y];
  }

  handleStepNumChange(newStepNum) {
    this.setState({
      stepNumber: newStepNum
    });
  }

  performWallMove(horizontal, aimX, aimY, then) {
    then = then || (_ => {});
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const walls = new Set(current.walls);
    const [p1, p2] = [current.player1, current.player2];
    let newHist = {
      walls: walls.add(this.wallCoordsToInt(horizontal, aimX, aimY)),
      player1: this.isPlayer1Turn()
        ? { x: p1.x, y: p1.y, remainingWalls: p1.remainingWalls - 1 }
        : p1,
      player2: this.isPlayer1Turn()
        ? p2
        : { x: p2.x, y: p2.y, remainingWalls: p2.remainingWalls - 1 }
    };
    this.setState({
      history: history.concat([newHist]),
      stepNumber: history.length
    }, then);
  }

  handleWallClick(horizontal, x, y) {
    const [w, h] = [this.props.width, this.props.height];
    const [aimX, aimY] = this.clickToWallCoords(horizontal, x, y, w, h);
    if (
      (horizontal && this.canPlaceHorizWall(aimX, aimY)) ||
      (!horizontal && this.canPlaceVertWall(aimX, aimY))
    ) {
      this.performWallMove(horizontal, aimX, aimY, () => this.upload());
    }
  }

  getMovesForPlayer(current, other, walls) {
    walls = walls || this.state.history[this.state.stepNumber].walls;
    let [w, h] = [this.props.width, this.props.height];
    // let asInt = pos => pos.y * w + pos.x;
    // let asObj = i => {x: i % w, y: ~~(i / w)};
    let moves = [
      // Basic moves
      {
        x: current.x - 1,
        y: current.y,
        t: _ => !this.isVertWallAt(current.x - 1, current.y, walls)
      },
      {
        x: current.x,
        y: current.y + 1,
        t: _ => !this.isHorizWallAt(current.x, current.y, walls)
      },
      {
        x: current.x + 1,
        y: current.y,
        t: _ => !this.isVertWallAt(current.x, current.y, walls)
      },
      {
        x: current.x,
        y: current.y - 1,
        t: _ => !this.isHorizWallAt(current.x, current.y - 1, walls)
      },
      // Jumps straight
      {
        x: current.x - 2,
        y: current.y,
        t: _ =>
          other.x === current.x - 1 &&
          other.y === current.y &&
          !this.isVertWallAt(current.x - 1, current.y, walls) &&
          !this.isVertWallAt(current.x - 2, current.y, walls)
      },
      {
        x: current.x,
        y: current.y + 2,
        t: _ =>
          other.x === current.x &&
          other.y === current.y + 1 &&
          !this.isHorizWallAt(current.x, current.y, walls) &&
          !this.isHorizWallAt(current.x, current.y + 1, walls)
      },
      {
        x: current.x + 2,
        y: current.y,
        t: _ =>
          other.x === current.x + 1 &&
          other.y === current.y &&
          !this.isVertWallAt(current.x, current.y, walls) &&
          !this.isVertWallAt(current.x + 1, current.y, walls)
      },
      {
        x: current.x,
        y: current.y - 2,
        t: _ =>
          other.x === current.x &&
          other.y === current.y - 1 &&
          !this.isHorizWallAt(current.x, current.y - 1, walls) &&
          !this.isHorizWallAt(current.x, current.y - 2, walls)
      },
      // Jump dodge walls
      {
        x: current.x + 1,
        y: current.y + 1,
        t: _ =>
          (other.x === current.x &&
            other.y === current.y + 1 &&
            other.y < h - 1 &&
            !this.isHorizWallAt(current.x, current.y, walls) &&
            this.isHorizWallAt(current.x, current.y + 1, walls) &&
            !this.isVertWallAt(current.x, current.y + 1, walls)) ||
          (other.x === current.x + 1 &&
            other.y === current.y &&
            other.x < w - 1 &&
            !this.isVertWallAt(current.x, current.y, walls) &&
            this.isVertWallAt(current.x + 1, current.y, walls) &&
            !this.isHorizWallAt(current.x + 1, current.y, walls))
      },
      {
        x: current.x - 1,
        y: current.y + 1,
        t: _ =>
          (other.x === current.x &&
            other.y === current.y + 1 &&
            other.y < h - 1 &&
            !this.isHorizWallAt(current.x, current.y, walls) &&
            this.isHorizWallAt(current.x, current.y + 1, walls) &&
            !this.isVertWallAt(current.x - 1, current.y + 1, walls)) ||
          (other.x === current.x - 1 &&
            other.y === current.y &&
            other.x > 0 &&
            !this.isVertWallAt(current.x - 1, current.y, walls) &&
            this.isVertWallAt(current.x - 2, current.y, walls) &&
            !this.isHorizWallAt(current.x - 1, current.y, walls))
      },
      {
        x: current.x - 1,
        y: current.y - 1,
        t: _ =>
          (other.x === current.x &&
            other.y === current.y - 1 &&
            other.y > 0 &&
            !this.isHorizWallAt(current.x, current.y - 1, walls) &&
            this.isHorizWallAt(current.x, current.y - 2, walls) &&
            !this.isVertWallAt(current.x - 1, current.y - 1, walls)) ||
          (other.x === current.x - 1 &&
            other.y === current.y &&
            other.x > 0 &&
            !this.isVertWallAt(current.x - 1, current.y, walls) &&
            this.isVertWallAt(current.x - 2, current.y, walls) &&
            !this.isHorizWallAt(current.x - 1, current.y - 1, walls))
      },
      {
        x: current.x + 1,
        y: current.y - 1,
        t: _ =>
          (other.x === current.x &&
            other.y === current.y - 1 &&
            other.y > 0 &&
            !this.isHorizWallAt(current.x, current.y - 1, walls) &&
            this.isHorizWallAt(current.x, current.y - 2, walls) &&
            !this.isVertWallAt(current.x, current.y - 1, walls)) ||
          (other.x === current.x + 1 &&
            other.y === current.y &&
            other.x < w - 1 &&
            !this.isVertWallAt(current.x, current.y, walls) &&
            this.isVertWallAt(current.x + 1, current.y, walls) &&
            !this.isHorizWallAt(current.x + 1, current.y - 1, walls))
      }
    ].filter(
      newPos =>
        newPos.x >= 0 && // Filter for valid moves on board
        newPos.x < w &&
        newPos.y >= 0 &&
        newPos.y < h &&
        newPos.t()
    );
    return moves;
  }

  performPlayerMove(x, y, then) {
    then = then || (_ => {});
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const walls = new Set(current.walls);
    const p1 = {
      x: current.player1.x,
      y: current.player1.y,
      remainingWalls: current.player1.remainingWalls
    };
    const p2 = {
      x: current.player2.x,
      y: current.player2.y,
      remainingWalls: current.player2.remainingWalls
    };
    let newHist = this.isPlayer1Turn()
      ? {
          walls: walls,
          player1: {x: x, y: y, remainingWalls: p1.remainingWalls},
          player2: p2
        }
      : {
          walls: walls,
          player1: p1,
          player2: {x: x, y: y, remainingWalls: p2.remainingWalls}
        };
    this.setState({
      history: history.concat([newHist]),
      stepNumber: history.length
    }, then);
  }

  handleCellClick(x, y) {
    const current = this.state.history[this.state.stepNumber];
    if (this.getWinner(current)) return; // do nothing
    const [p1, p2] = [current.player1, current.player2];
    let reduceIsMove = (acc, mv) => acc || (mv.x === x && mv.y === y);
    if (
      (this.isPlayer1Turn() &&
        this.getMovesForPlayer(p1, p2).reduce(reduceIsMove, false)) ||
      (!this.isPlayer1Turn() &&
        this.getMovesForPlayer(p2, p1).reduce(reduceIsMove, false))
    )
      this.performPlayerMove(x, y, () => this.upload());
    
  }

  getWinner(state) {
    return state.player1.y <= 0
      ? "1"
      : state.player2.y >= this.props.height - 1 ? "2" : null;
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.getWinner(current);
    const nowPlaying = this.isPlayer1Turn() ? current.player1 : current.player2;
    const otherPlaying = this.isPlayer1Turn()
      ? current.player2
      : current.player1;
    let mainContent = winner ? (
      <Winner isPlayer1={winner === "1"} />
    ) : (
      <div>
        <div className="game-info">
          <WallIndicator
            isPlayer1={false}
            wallsLeft={current.player2.remainingWalls}
          />
        </div>
        <div className="game-board">
          <Board
            walls={current.walls}
            player1={current.player1}
            player2={current.player2}
            onWallClick={(h, x, y) => this.handleWallClick(h, x, y)}
            onCellClick={(x, y) => this.handleCellClick(x, y)}
            onWallHover={(h, x, y) => this.handleWallHover(h, x, y)}
            onWallHoverClear={() => this.handleWallHoverClear()}
            onMouseOut={() => this.handleWallHoverClear()}
            isVertWallAt={(x, y) => this.isVertWallAt(x, y)}
            isHorizWallAt={(x, y) => this.isHorizWallAt(x, y)}
            isIntersectWallAt={(x, y) => this.isIntersectWallAt(x, y)}
            width={this.props.width}
            height={this.props.height}
            hoverWall={this.state.hoverWall}
            currentMoves={this.getMovesForPlayer(
              nowPlaying,
              otherPlaying,
              current.walls
            )}
            toMove={this.isPlayer1Turn() ? "1" : "2"}
          />
        </div>
        <div className="game-info">
          <WallIndicator
            isPlayer1={true}
            wallsLeft={current.player1.remainingWalls}
          />
        </div>
      </div>
    );

    return (
      <div>
        <Helmet>
          <title>Quoridor</title>
          <meta name="viewport" content="width=600"/>
        </Helmet>
        <div className="game">{mainContent}</div>
        <Share 
          src={this.URL_BASE + "#" + this.state.gameId}
          lastSeen={this.state.lastSeen}
          />
        <History
          current={this.state.stepNumber}
          max={this.state.history.length}
          onStepNumChange={x => this.handleStepNumChange(x)}
        />
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game width={9} height={9} />, document.getElementById("root"));

