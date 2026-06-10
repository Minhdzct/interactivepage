import { Injectable, signal, WritableSignal } from '@angular/core';

export interface Formula {
  id: number;
  fullText: string;
  typedText: WritableSignal<string>;
  top: string;
  left: string;
  isVisible: WritableSignal<boolean>;
  isFadingOut: WritableSignal<boolean>;
}

@Injectable({ providedIn: 'root' })
export class BackgroundService {
  readonly backgroundFormulas = signal<Formula[]>([]);
  private formulaIdCounter = 0;
  private readonly GRID_ROWS = 20;
  private readonly GRID_COLS = 30;
  private occupiedCells = new Set<string>();
  private backgroundInterval: any;
  private readonly FADE_DURATION = 1500;
  private readonly FORMULA_EXAMPLES = [
    'E = mc²', '∇·E = ρ/ε₀', '∇·B = 0', '∇×E = -∂B/∂t', '∇×B = μ₀(J+ε₀∂E/∂t)',
    '∫B·ds = μ₀I', 'Φ_B = ∫B·dA', 'F = q(E + v×B)', 'U = -p·E', 'C = Q/V',
    'R = V/I', 'P = IV', 'L = Φ_B/I', '∮E·dl = -dΦ_B/dt', 'x(t) = Acos(ωt+φ)',
    'λ = h/p', 'ΔxΔp ≥ ħ/2', 'HΨ = EΨ', 'PV = nRT', 'dS ≥ 0',
    'F = G(m₁m₂/r²)', 'a² + b² = c²', 'sin(α±β) = sinαcosβ±cosαsinβ',
    'e^(iπ) + 1 = 0', '1+1=2'
  ];

  start(): void {
    this.backgroundInterval = setInterval(() => {
      if (this.backgroundFormulas().length < 50) {
        this.addAndAnimateNewFormula();
      }
    }, 200);
  }

  stop(): void {
    clearInterval(this.backgroundInterval);
  }

  private findAvailableCell(): { row: number; col: number } | null {
    const deadZone = {
      rowStart: 5,
      rowEnd: 15,
      colStart: 8,
      colEnd: 22,
    };

    const availableCells: { row: number; col: number }[] = [];
    for (let r = 0; r < this.GRID_ROWS; r++) {
      for (let c = 0; c < this.GRID_COLS; c++) {
        const isOccupied = this.occupiedCells.has(`${r}:${c}`);
        const isInDeadZone =
          r >= deadZone.rowStart &&
          r <= deadZone.rowEnd &&
          c >= deadZone.colStart &&
          c <= deadZone.colEnd;
        if (!isOccupied && !isInDeadZone) {
          availableCells.push({ row: r, col: c });
        }
      }
    }

    if (availableCells.length === 0) return null;
    return availableCells[Math.floor(Math.random() * availableCells.length)];
  }

  private async addAndAnimateNewFormula(): Promise<void> {
    const cell = this.findAvailableCell();
    if (!cell) return;

    const cellKey = `${cell.row}:${cell.col}`;
    this.occupiedCells.add(cellKey);

    const newFormula: Formula = {
      id: this.formulaIdCounter++,
      fullText:
        this.FORMULA_EXAMPLES[Math.floor(Math.random() * this.FORMULA_EXAMPLES.length)],
      typedText: signal(''),
      top: `${(cell.row / this.GRID_ROWS) * 100}%`,
      left: `${(cell.col / this.GRID_COLS) * 100}%`,
      isVisible: signal(false),
      isFadingOut: signal(false),
    };

    this.backgroundFormulas.update((formulas) => [...formulas, newFormula]);

    requestAnimationFrame(() => newFormula.isVisible.set(true));

    const typingSpeed = 50 + Math.random() * 50;
    for (let i = 0; i < newFormula.fullText.length; i++) {
      const nextChar = newFormula.fullText[i];
      newFormula.typedText.update((text) => text + nextChar);
      await new Promise((res) => setTimeout(res, typingSpeed));
    }

    newFormula.isFadingOut.set(true);

    setTimeout(() => {
      this.backgroundFormulas.update((formulas) =>
        formulas.filter((f) => f.id !== newFormula.id)
      );
      this.occupiedCells.delete(cellKey);
    }, this.FADE_DURATION);
  }
}
