class Scramble {
	constructor() {
		this.moves = ['U', 'F', 'R', 'B', 'L', 'D'];
		this.length = 20;
		this.scramble = null;
		this.previousScramble = null;

		this.spanScramble = document.querySelector("#spanScramble");
		this.buttonScramblePrevious = document.querySelector("#buttonScramblePrevious");
		this.buttonScrambleNext = document.querySelector("#buttonScrambleNext");

		this.buttonScramblePrevious.addEventListener("click", () => {
			if (this.previousScramble)
				this.spanScramble.innerHTML = this.previousScramble;
		})
		this.buttonScrambleNext.addEventListener("click", () =>
			this.generate()
		)

		this.generate();
	}

	generate() {
		this.previousScramble = this.spanScramble.innerHTML;

		this.scramble = [];
		let move, lastMove;
		for (let i = 0; i < this.length; i++) {
			move = lastMove;
			while (move == lastMove)
				move = this.moves[Math.floor(Math.random() * this.moves.length)];
		    this.scramble.push(move);
		    const r = Math.random();
		    if (r >= 0.5) {
		    	if (r >= 0.75) {
		    		this.scramble[i] += "'";
		    	} else {
		    		this.scramble[i] += "2";
		    	}
		    }
		    lastMove = move;
		}

		this.spanScramble.innerHTML = this.scramble.join(" ");
	}
}


class Solves {
	constructor() {
		this.solves = localStorage.getItem("solves");
		this.solves = this.solves ? JSON.parse(this.solves).reverse() : [];

		this.tableSolvesList = document.querySelector("#tableSolvesList");

		this.currIndex = 0;
		this.solves.forEach((solve, i) => {
			this.displaySolve(
				i,
				solve.time,
				solve.plus2,
				solve.dnf
			)
			this.currIndex ++;
		})
	}

	displaySolve(index) {
		const row = this.tableSolvesList.insertRow(1);
		let cells = [];

		for (let i = 0; i < 5; i++) {
			cells.push(row.insertCell(i));
		}

		cells[0].textContent = index + 1;
		cells[2].textContent = "+2";
		cells[3].textContent = "dnf";
		cells[4].textContent = "X";

		this.updateRow(cells[1], index);

		cells[2].addEventListener("click", () => {
			this.solves[index].plus2 = !this.solves[index].plus2;
			this.updateRow(cells[1], index);
			stats.update();
		})
		cells[3].addEventListener("click", () => {
			this.solves[index].dnf = !this.solves[index].dnf;
			this.updateRow(cells[1], index);
			stats.update();
		})
		cells[4].addEventListener("click", () => {
			row.remove();
			this.solves.splice(index, 1);
			return;		
			stats.update();	
		})			
	}

	updateRow(cell, index) {
		const solve = this.solves[index];

		cell.textContent = 
			solve.dnf ? "dnf" : (
				(solve.plus2 ? (Number(solve.time) + 2) : Number(solve.time)).toFixed(2)
			);

		if (this.solves[index].dnf) {
			cell.style.color = "red";
		} else if (this.solves[index].plus2) {
			cell.style.color = "orange";
		} else {
			cell.style.color = "white";
		}
	}

	getTotalAvg() {
		let sum = 0;
		let dnfs = 0;

		this.solves.forEach((solve, i) => {
			if (solve.dnf)
				dnfs++;
			sum += solve.dnf ? 0 : (solve.plus2 ? solve.time + 2 : solve.time)
		});

		return sum / this.solves.length - dnfs;		
	}

	getAvg(n) {
		let avgSolves = this.solves
			.slice(-n)
			.sort((a, b) => a.time - b.time);
		if (avgSolves.length < n)
			return null;

		let dnfs = 0;
		avgSolves.forEach((solve) => {
			if (solve.dnf) dnfs++;
		});

		if (dnfs) {
			if (dnfs > 1) return null;
		} else {
			avgSolves.pop();
		}
		avgSolves.shift();

		let sum = 0;
		avgSolves.forEach((solve) => {
			sum += solve.plus2 ? solve.time + 2 : solve.time;
		});

		return sum / avgSolves.length; 
	}

	add(solve) { 
		this.solves.push(solve);
		this.displaySolve(
			this.currIndex,
			solve.time,
			solve.plus2,
			solve.dnf
		);

		this.currIndex ++;
	}
}

class Stats {
	constructor() {
		this.stats = localStorage.getItem("stats");
		this.stats = this.stats ? JSON.parse(this.stats) : { 
			avg : {
				curr : null,
				best : null,
				dnf : false
			}, ao5 : {
				curr : null,
				best : null,
				dnf : false
			}
		};

		this.thAvgCurr = document.querySelector("#thAvgCurr");
		this.thAvgBest = document.querySelector("#thAvgBest");
		this.thAo5Curr = document.querySelector("#thAo5Curr");
		this.thAo5Best = document.querySelector("#thAo5Best");

		this.thAvgCurr.textContent = this.stats.avg.curr != null ? 
			this.stats.avg.curr.toFixed(2) :
			'-';
		this.thAvgBest.textContent = this.stats.avg.best != null ?
			this.stats.avg.best.toFixed(2) :
			'-';
		this.thAo5Curr.textContent = this.stats.ao5.curr != null && !this.stats.ao5.dnf ? 
			this.stats.ao5.curr.toFixed(2) :
			'-';
		this.thAo5Best.textContent = this.stats.ao5.best != null && !this.stats.ao5.dnf ?
			this.stats.ao5.best.toFixed(2) :
			'-';	
	}

	update() {
		this.stats.avg.curr = solves.getTotalAvg();
		this.stats.ao5.curr = solves.getAvg(5);
		if (!this.stats.ao5.curr)
			this.stats.ao5.dnf = true;
		else
			this.stats.ao5.dnf = false;

		if (this.stats.avg.best == null || this.stats.avg.curr < this.stats.avg.best)
			this.stats.avg.best = this.stats.avg.curr;
		this.thAvgBest.textContent = this.stats.avg.best != null ? this.stats.avg.best.toFixed(2) : '-';

		if (this.stats.ao5.best == null || this.stats.ao5.curr < this.stats.ao5.best)
			this.stats.ao5.best = this.stats.ao5.curr;
		this.thAo5Best.textContent = this.stats.ao5.best != null && !this.stats.ao5.dnf ? this.stats.ao5.best.toFixed(2) : '-';

		this.thAvgCurr.textContent = this.stats.avg.curr != null ? this.stats.avg.curr.toFixed(2) : '-';
		this.thAo5Curr.textContent = this.stats.ao5.curr != null && !this.stats.ao5.dnf ? this.stats.ao5.curr.toFixed(2) : '-';
	}
}


class Timer {
	constructor() {
		this.inputTimer = document.querySelector("#inputTimer");

		document.addEventListener("keydown", function(event) {
			if (event.key === "Enter") {
				const solveInput = inputTimer.value
					.trim()
					.toLowerCase();
				if (solveInput) {
					const plus2 = solveInput.includes("+");
					const dnf = solveInput.includes("dnf");
					let solveTime = parseFloat(inputTimer.value);
					if (!solveInput.includes(".")) {
						solveTime /= 100;
					}

					if (isNaN(solveTime) || solveTime <= 0) {
						window.alert("Invalid time")
					} else {
						const solve = {
							time : solveTime,
							scramble : scramble.scramble,
							plus2 : plus2,
							dnf : dnf	
						};
						solves.add(solve);
						stats.update();
					}

					inputTimer.value = null;
				}
			} if (event.key === "Control") {
				scramble.generate();
			}
 		});
	}
}


class Settings {
	constructor() {
		this.buttonSettingsOpen = document.querySelector("#buttonSettingsOpen");
		this.sectionSettings = document.querySelector("#section-4");
		this.divSettingsBackground = document.querySelector("#divSettingsBackground");
		this.divSettingsBody = document.querySelector("#divSettingsBody");	

		this.buttonSettingsOpen.addEventListener("click", () => 
			this.open()
		);
	}

	open() {
		if (this.sectionSettings.style.display === "none") {
			this.sectionSettings.style.display = "block";
		} else {
			this.sectionSettings.style.display = "none";
		}		
	}
}


document.addEventListener("DOMContentLoaded", () => {
	window.scramble = new Scramble();
	window.solves = new Solves();
	window.stats = new Stats();	
	window.timer = new Timer();	
	window.settings = new Settings();
});
window.addEventListener("beforeunload", () => {
	localStorage.setItem("currId", solves.currId);
	localStorage.setItem("solves", JSON.stringify(solves.solves.reverse()));
	localStorage.setItem("stats", JSON.stringify(stats.stats));
});
