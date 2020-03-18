import { Body } from './body';

export interface EntityInterface {
  body?: Body;
  collisions?: Array<EntityInterface>;
  finished: boolean;
  update(now: number): void;
  render(): void;
}
