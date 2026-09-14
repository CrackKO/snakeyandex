import Phaser from 'phaser';
import { GRID_SIZE, COLORS } from '../constants/GameConstants';

interface Segment {
  x: number;
  y: number;
}

export class Snake extends Phaser.GameObjects.Container {
  private segments: Segment[] = [];
  private direction: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private nextDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(1, 0);
  private graphics: Phaser.GameObjects.Graphics;
  private speed: number = 150;
  private isDashing: boolean = false;
  private dashCooldown: number = 0;
  private invulnerable: boolean = false;
  private shieldCount: number = 0;
  
  constructor(scene: Phaser.Scene, startX: number, startY: number) {
    super(scene, startX, startY);
    
    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    
    // Initialize with 3 segments
    for (let i = 0; i < 3; i++) {
      this.segments.push({ x: startX - i * GRID_SIZE, y: startY });
    }
    
    scene.add.existing(this);
  }

  update(time: number): void {
    if (this.dashCooldown > 0) {
      this.dashCooldown -= 16;
    }
    
    this.render();
  }

  render(): void {
    this.graphics.clear();
    
    const color = this.isDashing ? 0xffffff : COLORS.snake.common;
    const alpha = this.invulnerable ? 0.5 + Math.sin(Date.now() / 50) * 0.3 : 1;
    
    this.segments.forEach((segment, index) => {
      const size = index === 0 ? GRID_SIZE + 2 : GRID_SIZE - 2;
      
      this.graphics.fillStyle(color, alpha);
      this.graphics.fillCircle(segment.x, segment.y, size / 2);
      
      // Glow effect
      this.graphics.lineStyle(2, color, 0.5 * alpha);
      this.graphics.strokeCircle(segment.x, segment.y, size / 2 + 3);
      
      // Eyes on head
      if (index === 0) {
        this.graphics.fillStyle(0x000000, 1);
        const eyeOffset = GRID_SIZE / 4;
        const eyeSize = 3;
        
        if (this.direction.x === 1) {
          this.graphics.fillCircle(segment.x + 3, segment.y - eyeOffset, eyeSize);
          this.graphics.fillCircle(segment.x + 3, segment.y + eyeOffset, eyeSize);
        } else if (this.direction.x === -1) {
          this.graphics.fillCircle(segment.x - 3, segment.y - eyeOffset, eyeSize);
          this.graphics.fillCircle(segment.x - 3, segment.y + eyeOffset, eyeSize);
        } else if (this.direction.y === -1) {
          this.graphics.fillCircle(segment.x - eyeOffset, segment.y - 3, eyeSize);
          this.graphics.fillCircle(segment.x + eyeOffset, segment.y - 3, eyeSize);
        } else {
          this.graphics.fillCircle(segment.x - eyeOffset, segment.y + 3, eyeSize);
          this.graphics.fillCircle(segment.x + eyeOffset, segment.y + 3, eyeSize);
        }
      }
    });
  }

  setDirection(x: number, y: number): void {
    // Prevent 180 degree turns
    if (x !== 0 && this.direction.x !== 0) return;
    if (y !== 0 && this.direction.y !== 0) return;
    
    this.nextDirection = new Phaser.Math.Vector2(x, y);
  }

  move(): void {
    this.direction = this.nextDirection.clone();
    
    const head = this.segments[0];
    const newHead = {
      x: head.x + this.direction.x * GRID_SIZE,
      y: head.y + this.direction.y * GRID_SIZE,
    };
    
    this.segments.unshift(newHead);
    this.segments.pop();
  }

  grow(amount: number = 1): void {
    const tail = this.segments[this.segments.length - 1];
    for (let i = 0; i < amount; i++) {
      this.segments.push({ ...tail });
    }
  }

  getHead(): Segment {
    return this.segments[0];
  }

  getSegments(): Segment[] {
    return [...this.segments];
  }

  getLength(): number {
    return this.segments.length;
  }

  checkSelfCollision(): boolean {
    const head = this.segments[0];
    for (let i = 1; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const dist = Phaser.Math.Distance.Between(head.x, head.y, segment.x, segment.y);
      if (dist < GRID_SIZE - 5) {
        return true;
      }
    }
    return false;
  }

  useDash(): boolean {
    if (this.dashCooldown <= 0) {
      this.isDashing = true;
      this.dashCooldown = 5000;
      
      setTimeout(() => {
        this.isDashing = false;
      }, 300);
      
      return true;
    }
    return false;
  }

  getDashCooldown(): number {
    return Math.max(0, this.dashCooldown);
  }

  addShield(): void {
    if (this.shieldCount < 2) {
      this.shieldCount++;
    }
  }

  hasShield(): boolean {
    return this.shieldCount > 0;
  }

  useShield(): boolean {
    if (this.shieldCount > 0) {
      this.shieldCount--;
      return true;
    }
    return false;
  }

  setInvulnerable(duration: number): void {
    this.invulnerable = true;
    setTimeout(() => {
      this.invulnerable = false;
    }, duration);
  }

  isInvulnerable(): boolean {
    return this.invulnerable;
  }

  reset(startX: number, startY: number): void {
    this.segments = [];
    for (let i = 0; i < 3; i++) {
      this.segments.push({ x: startX - i * GRID_SIZE, y: startY });
    }
    this.direction = new Phaser.Math.Vector2(1, 0);
    this.nextDirection = new Phaser.Math.Vector2(1, 0);
    this.isDashing = false;
    this.dashCooldown = 0;
    this.invulnerable = false;
    this.shieldCount = 0;
  }

  destroy(): void {
    this.graphics.destroy();
    super.destroy();
  }
}
