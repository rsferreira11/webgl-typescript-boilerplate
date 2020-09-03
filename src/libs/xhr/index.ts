type NetworkError = {
  status: number,
  url?: string
};

type callbackType = typeof getContentFromUrl;

type callbackQueueItemType = {
  fn: callbackType,
  args: Parameters<callbackType>
};

type endCallbackQueueType = {
  fn: () => void,
  args: []
};

export function getContentFromUrl(url: string, cb: (err: NetworkError | null, data: string) => void): void {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url);

  xhr.onreadystatechange = () => {
    if (xhr.readyState !== 4) {
      return;
    }

    const isValid = xhr.status >= 200 && xhr.status < 400;

    if (!isValid) {
      cb({ status: xhr.status, url }, "");
      return;
    }

    cb(null, xhr.responseText);
  }

  xhr.send();
}

export function getContentFromUrls(urls: string[], cb: (err: NetworkError | null, data: string[]) => void): void {
  const data: string[] = [];

  const queue: [ endCallbackQueueType, ...callbackQueueItemType[] ] = [
    { fn: function test() {
      cb(null, data);
    }, args: [] }
  ];

  for (let i = urls.length - 1; i >= 0; i--) {
    (function(queueIndex, urlIndex) {
      queue.push({
        fn: getContentFromUrl,
        args: [
          urls[urlIndex],
          function(err, newText) {
            if (err) {
              cb(err, data);
              return;
            }

            data[urlIndex] = newText;

            const nextCbData: any = queue[queueIndex];
            nextCbData.fn.apply(null, nextCbData.args);
          }
        ]
      })
    })(queue.length - 1, i);
  }

  const firstItem: any = queue[queue.length - 1];
  firstItem.fn.apply(null, firstItem.args);
}
