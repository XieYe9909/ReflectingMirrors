declare const wx: any;

export async function showWechatInputName(): Promise<string | null> {
    let title = '自定义关卡名 (15 字符以内）';
    let content = '';
    let placeholder = '请输入...';
    let confirmText = '确定';
    let cancelText = '取消';
    const MAX_LENGTH = 15;

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