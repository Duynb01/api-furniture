import * as crypto from 'crypto';

export function createVnpayUrl(params: Record<string, any>, secretKey: string, vnpUrl: string) {
  // const sorted = Object.keys(params)
  //   .sort()
  //   .reduce((obj, key) => {
  //     obj[key] = params[key];
  //     return obj;
  //   }, {} as Record<string, any>);
  //
  // const signData = Object.keys(sorted)
  //   .sort()
  //   .map((key) => `${key}=${encodeURIComponent(sorted[key])}`)
  //   .join('&');
  // const hmac = crypto.createHmac('sha512', secretKey);
  // const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  //
  // console.log('Sorted: ',sorted);
  // console.log('signData: ',signData);
  // console.log('hmac: ',hmac);
  // console.log('secureHash: ',secureHash);
  // console.log("url ",`${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`);
  //
  // return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
    const data: Record<string, string> = {};
    Object.keys(params).forEach((k) => {
      if (params[k] !== null && params[k] !== undefined && params[k] !== '') {
        data[k] = String(params[k]);
      }
    });
    const sortedKeys = Object.keys(data).sort();
    const signData = sortedKeys.map(k => `${k}=${encodeURIComponent(data[k])}`).join('&');
    const secureHash = crypto.createHmac('sha512', secretKey)
      .update(signData, 'utf-8')
      .digest('hex');
    return `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
}