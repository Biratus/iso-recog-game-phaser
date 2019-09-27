import 'phaser';
import BootScene from '../scenes/BootScene';
import LoadScene from '../scenes/LoadScene';
import EditorScene from '../scenes/EditorScene';
import InteractionScene from '../scenes/InteractionScene';

export const gameConfig = {
  type: Phaser.WEBGL,
  parent: 'gameContainer',
  scene: [BootScene, LoadScene,EditorScene,InteractionScene],
  width:window.innerWidth,height:window.innerHeight*0.99
  // resolution:10
  // physics:{
  //   debug:true
  // }
}