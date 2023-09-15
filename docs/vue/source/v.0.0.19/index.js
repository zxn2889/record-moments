const source = `<div>This is a paragraph of text.</div>`

function getTokens(code) {
    const status= {
        origin: 1, // 起始状态
        startTag: 2, // 开始标签状态
        tagName: 3, // 标签名称状态
        text: 4, // 文本状态
        endTag: 5, // 开始结束标签状态
        endTagName: 6 // 结束结束标签状态
    }

    const tokens = []
    let content = []
    let currentStatus = status.origin

    function isLetter(letter) {
        const c = letter.charCodeAt()
        return (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || /^[\u4E00-\u9FA5]+$/.test(letter) || /\s/.test(letter)
    }

    for (let i = 0; i < code.length; i++) {
        // debugger
        const letter = code[i];
        if (letter === '<') {
            if (currentStatus === status.text) {
                tokens.push({ type: 'text', content: content.join('') })
                content.length = 0
            }
            currentStatus = status.startTag
            continue;
        } else if (isLetter(letter)) {
            content.push(letter)
            if (currentStatus === status.startTag) {
                currentStatus = status.tagName
                continue;
            } else if (currentStatus === status.origin) {
                currentStatus = status.text
                continue;
            } else if (currentStatus === status.endTag) {
                currentStatus = status.endTagName
                continue;
            }
        } else if (letter === '>') {
            if (currentStatus === status.tagName) {
                console.log('content', content);
                tokens.push({ type: 'startTag', tag: content.join('') })
                content.length = 0
                currentStatus = status.origin
                continue;
            } else if (currentStatus === status.endTagName) {
                tokens.push({ type: 'endTag', tag: content.join('') })
                content.length = 0
                currentStatus = status.origin
                continue;
            }
        } else if (letter === '/') {
            currentStatus = status.endTag
            continue;
        }
    }
    console.log('tokens', tokens);
}

getTokens(source)