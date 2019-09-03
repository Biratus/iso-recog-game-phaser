import 'phaser';
import BootScene from '../scenes/BootScene';
import GameScene from '../scenes/GameScene';
import LoadScene from '../scenes/LoadScene';
import TutorialScene from '../scenes/TutorialScene';
import MenuScene from '../scenes/MenuScene';

export const gameConfig = {
  type: Phaser.WEBGL,
  parent: 'gameContainer',
  scene: [BootScene, LoadScene, MenuScene,GameScene, TutorialScene],
  // physics:{
  //   debug:true
  // }
}