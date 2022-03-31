// webtransport
// 建立一个基于http/3的双向数据通道
// 相比于UDP，多了加密和拥塞控制

const url = ''
const transport = new WebTransport(url)

transport.closed.then(() => {
  console.log('closed')
}).catch(error => {
  console.error('closed error: ', error)
})

await transport.ready

// send
const writer = transport.datagrams.writable.getWriter();
const data = new Uint8Array([65, 66, 67]);

writer.write(data);

// receive
const reader = transport.datagrams.readable.getReader();
while(true) {
  const { value, done } = await reader.read();
  if (done) {
    break;
  }
  console.log(value);
}

// close writer
// 关闭连接，浏览器会在连接真正关闭之前，发送所有pendding的数据
await writer.close()

// abort writer
// 退出并舍弃pendding的数据
await writer.abort()

// bidirectionalStream 双向流
const stream = await transport.createBidirectionalStream();
// stream is a BidirectionalStream
// stream.readable is a ReadableStream
// stream.writable is a WritableStream

