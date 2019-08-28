import 'phaser'
import { gameConfig } from './constants/GameConfig'
import { GameModule } from './objects/utils/GameUtils';

window.onload = () => {
  /* eslint-disable no-unused-vars */
  GameModule.game = new Phaser.Game(gameConfig)
}
