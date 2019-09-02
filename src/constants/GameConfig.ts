import 'phaser';
import BootScene from '../scenes/BootScene';
import GameScene from '../scenes/GameScene';
import LoadScene from '../scenes/LoadScene';
import TutorialScene from '../scenes/TutorialScene';
import TestScene from '../scenes/TestScene';

export const gameConfig = {
  type: Phaser.WEBGL,
  parent: 'gameContainer',
  scene: [BootScene, LoadScene, GameScene, TutorialScene,TestScene],
  // physics:{
  //   debug:true
  // }
}