
import { _decorator, Component, director } from 'cc';
import { CurrentLevel } from './FirstPage';
const { ccclass } = _decorator;
 
@ccclass('SceneSwitch')
export class SceneSwitch extends Component {
    buttoncallback(event:Event, sceneName:string) {
        if(isNaN(Number(sceneName))) {
            director.loadScene(sceneName);
        }
        else {
            CurrentLevel[0] = Number(sceneName);
            director.loadScene('Level');
        }
    }
}
