import { Node } from "cc";

export function getIndexByID(targetNode: Node, array: Node[]): number {
    return array.findIndex(arrayNode => arrayNode.uuid === targetNode.uuid);
}

export function generateLocate(i: number): number[] {
    let x: number, y: number;
    if(i < 12) {
        x = i;
        y = 1;
    }
    else {
        x = i - 12;
        y = 0;
    }
    return [x, y];
}

export async function showWechatInputName(level_index: number=0): Promise<string | null> {
    if (typeof wx === 'undefined') {
        console.log('非微信环境');
        return '新关卡' + (level_index + 1);
    }

    let title = '自定义关卡名 (10 字符以内）';
    let content = '';
    let placeholder = '请输入...';
    let confirmText = '确定';
    let cancelText = '取消';
    const MAX_LENGTH = 10;

    return new Promise((resolve) => {
        wx.showModal({
        title,
        editable: true,
        content,
        placeholderText: placeholder,
        confirmText,
        cancelText,
        success: (res: { confirm: any; content: any; }) => {
            if (res.confirm) {
                // 用户点击确定，返回输入的内容
                let input = res.content || '';
                if (input.length > MAX_LENGTH) {
                    wx.showToast({
                        title: '最多输入 ${MAX_LENGTH} 个字符',
                        icon: 'none'
                    });
                    input = input.substring(0, MAX_LENGTH);
                }
                resolve(input);
            }
            else {
                // 用户取消输入
                resolve(null);
            }
        },
        fail: () => {
            // 调用失败时也返回 null
            resolve(null);
        }
        });
    });
}

export async function showWechatInputCode(): Promise<string | null> {
    if (typeof wx === 'undefined') {
        console.log('非微信环境');
        return 'B0f0P7mQ11248192R7l0n0V6l-n8l-n';
    }

    let title = '请输入关卡代码';
    let content = '';
    let placeholder = '请输入...';
    let confirmText = '确定';
    let cancelText = '取消';

    return new Promise((resolve) => {
        wx.showModal({
        title,
        editable: true,
        content,
        placeholderText: placeholder,
        confirmText,
        cancelText,
        success: (res: { confirm: any; content: any; }) => {
            if (res.confirm) {
            // 用户点击确定，返回输入的内容
                resolve(res.content || '');
            } else {
            // 用户取消输入
                resolve(null);
            }
        },
        fail: () => {
            // 调用失败时也返回null
            resolve(null);
        }
        });
    });
}

export async function showUserConfirm(message: string, confirmText='确定', cancelText ='取消', non_wx_default=true): Promise<boolean | null> {
    if (typeof wx === 'undefined') {
        console.log('非微信环境');
        return true;
    }

    let title = '操作确认';
    return new Promise((resolve) => {
        wx.showModal({
        title,
        content: message,
        confirmText,
        cancelText,
        success: (res: { confirm: any; }) => {
            if (res.confirm) {
            // 用户点击确定
                resolve(true);
            } else {
            // 用户点击确定
                resolve(false);
            }
        },
        fail: () => {
            // 调用失败时返回非微信默认值
            resolve(non_wx_default);
        }
        });
    });
}

export function copy2Clipboard(data: string) {
    if (typeof wx == 'undefined') {
        console.log('非微信环境');
        return;
    }

    wx.setClipboardData({
        data: data},
    ).then(() => {
        wx.showToast({
            title: '已复制关卡代码到剪贴板',
        })
    }).catch(err => {
        console.error('复制失败', err)
    })
}