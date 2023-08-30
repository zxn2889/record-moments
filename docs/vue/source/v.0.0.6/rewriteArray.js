// 重写数组的读取方法
const rewriteArrReadRecordMap = ['includes', 'indexOf', 'lastIndexOf']
const rewriteArrReadRecord = {}
rewriteArrReadRecordMap.forEach(method => {
    const origanMethod = Array.prototype[method]
    rewriteArrReadRecord[method] = function(...args) {
        let res = origanMethod.apply(this, args)
        if (!res) {
            res = origanMethod.apply(this.raw, args)
        }
        
        return res
    }
})

// 重写数组的修改方法
let blockTrack = false
const rewriteArrWriteRecordMap = ['push', 'pop', 'shift', 'unshift', 'splice']
const rewriteArrWriteRecord = {}
rewriteArrWriteRecordMap.forEach(method => {
    const origanMethod = Array.prototype[method]
    rewriteArrWriteRecord[method] = function(...args) {
        blockTrack = true
        const res = origanMethod.apply(this, args)
        blockTrack = false
        return res
    }
})

export {
    rewriteArrReadRecord,
    blockTrack,
    rewriteArrWriteRecord
}