
import { _decorator, Component, UITransform, Sprite, SpriteFrame, resources, Color } from 'cc';
const { ccclass } = _decorator;

@ccclass('LightPiece')
export class LightPiece extends Component {
    locate:number[];
    dir:number;

    onLoad() {
        let UI = this.node.addComponent(UITransform);
        UI.anchorX = 0;
        UI.anchorY = 0.5;

        let sprite = this.node.addComponent(Sprite);
        resources.load('LightPiece/spriteFrame', SpriteFrame, (_err: any, spriteFrame: SpriteFrame) => {
            sprite.spriteFrame = spriteFrame;
        });
        sprite.color = new Color(0, 0, 0, 0);
    }
}
