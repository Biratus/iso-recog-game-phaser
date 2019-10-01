import 'phaser'
import { GameModule } from './objects/utils/GameModule';
import { gameConfig } from './constants/Constants';

window.onload = () => {
  /* eslint-disable no-unused-vars */
  GameModule.game = new Phaser.Game(gameConfig)
}
