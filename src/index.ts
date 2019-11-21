import 'phaser'
import { gameConfig } from './constants/Constants';
import { GameModule } from './utils/GameModule';

window.onload = () => {
  /* eslint-disable no-unused-vars */
  GameModule.game = new Phaser.Game(gameConfig)
}
