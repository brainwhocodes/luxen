export const ZipWriter = (function () {
  const CRC_TABLE = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(buf: Uint8Array) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) {
      c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    }
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function dosDateTime() {
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    return { time: time, date: date };
  }
  const asBlobPart = (bytes: Uint8Array): BlobPart => bytes as unknown as BlobPart;


  function build(entries: { name: string; data: Uint8Array }[]) {
    const parts: BlobPart[] = [];
    const central: Uint8Array[] = [];
    let offset = 0;
    const dt = dosDateTime();
    let cdSize = 0;

    entries.forEach(function (e) {
      const nameBytes = new TextEncoder().encode(e.name);
      const crc = crc32(e.data);
      const local = new Uint8Array(30 + nameBytes.length);
      const v = new DataView(local.buffer);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, 0x0800, true);
      v.setUint16(8, 0, true);
      v.setUint16(10, dt.time, true);
      v.setUint16(12, dt.date, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, e.data.length, true);
      v.setUint32(22, e.data.length, true);
      v.setUint16(26, nameBytes.length, true);
      v.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      parts.push(asBlobPart(local), asBlobPart(e.data));

      const cd = new Uint8Array(46 + nameBytes.length);
      const c = new DataView(cd.buffer);
      c.setUint32(0, 0x02014b50, true);
      c.setUint16(4, 20, true);
      c.setUint16(6, 20, true);
      c.setUint16(8, 0x0800, true);
      c.setUint16(10, 0, true);
      c.setUint16(12, dt.time, true);
      c.setUint16(14, dt.date, true);
      c.setUint32(16, crc, true);
      c.setUint32(20, e.data.length, true);
      c.setUint32(24, e.data.length, true);
      c.setUint16(28, nameBytes.length, true);
      c.setUint32(42, offset, true);
      cd.set(nameBytes, 46);
      central.push(cd);
      cdSize += cd.length;

      offset += local.length + e.data.length;
    });


    const end = new Uint8Array(22);
    const ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, entries.length, true);
    ev.setUint16(10, entries.length, true);
    ev.setUint32(12, cdSize, true);
    ev.setUint32(16, offset, true);

    return new Blob([...parts, ...central.map(asBlobPart), asBlobPart(end)], { type: "application/zip" });
  }

  return { build: build };
})();
