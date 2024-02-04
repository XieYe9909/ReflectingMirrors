
import { _decorator, Component, Sprite, Color} from 'cc';
import { GetTotalColor } from './Square';
const { ccclass } = _decorator;

@ccclass('Flower')
export class Flower extends Component {
    locate = [0, 0];
    color = [false, false, false];
    state = false;

    ChangeState() {
        let [r, g, b] = GetTotalColor(this.locate);
        if(r == this.color[0] && g == this.color[1] && b == this.color[2]) {
            this.state = true;
        }
        else {
            this.state = false;
        }

        let sprite = this.getComponent(Sprite);
        if(this.state) {
            this.node.setScale(1, 1);
            sprite.color = new Color(this.color[0] ? 255 : 0, this.color[1] ? 255 : 0, this.color[2] ? 255 : 0, 255);
        }
        else {
            this.node.setScale(0.9, 0.9);
            if (this.color[0] || this.color[1] || this.color[2]) {
                sprite.color = new Color(this.color[0] ? 150 : 0, this.color[1] ? 150 : 0, this.color[2] ? 150 : 0, 255);
            }
            else {
                sprite.color = new Color(80, 80, 80, 255);
            }
        }
    }
}
