// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array3, tail) {
    let t = tail || new Empty();
    for (let i = array3.length - 1; i >= 0; --i) {
      t = new NonEmpty(array3[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return true;
      desired--;
    }
    return desired <= 0;
  }
  // @internal
  hasLength(desired) {
    for (let _ of this) {
      if (desired <= 0)
        return false;
      desired--;
    }
    return desired === 0;
  }
  countLength() {
    let length3 = 0;
    for (let _ of this)
      length3++;
    return length3;
  }
};
function prepend(element2, tail) {
  return new NonEmpty(element2, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var BitArray = class _BitArray {
  constructor(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw "BitArray can only be constructed from a Uint8Array";
    }
    this.buffer = buffer;
  }
  // @internal
  get length() {
    return this.buffer.length;
  }
  // @internal
  byteAt(index2) {
    return this.buffer[index2];
  }
  // @internal
  floatAt(index2) {
    return byteArrayToFloat(this.buffer.slice(index2, index2 + 8));
  }
  // @internal
  intFromSlice(start4, end) {
    return byteArrayToInt(this.buffer.slice(start4, end));
  }
  // @internal
  binaryFromSlice(start4, end) {
    return new _BitArray(this.buffer.slice(start4, end));
  }
  // @internal
  sliceAfter(index2) {
    return new _BitArray(this.buffer.slice(index2));
  }
};
function byteArrayToInt(byteArray) {
  byteArray = byteArray.reverse();
  let value2 = 0;
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value2 = value2 * 256 + byteArray[i];
  }
  return value2;
}
function byteArrayToFloat(byteArray) {
  return new Float64Array(byteArray.reverse().buffer)[0];
}
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value2) {
    super();
    this[0] = value2;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error2 = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values = [x, y];
  while (values.length) {
    let a = values.pop();
    let b = values.pop();
    if (a === b)
      continue;
    if (!isObject(a) || !isObject(b))
      return false;
    let unequal = !structurallyCompatibleObjects(a, b) || unequalDates(a, b) || unequalBuffers(a, b) || unequalArrays(a, b) || unequalMaps(a, b) || unequalSets(a, b) || unequalRegExps(a, b);
    if (unequal)
      return false;
    const proto = Object.getPrototypeOf(a);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a.equals(b))
          continue;
        else
          return false;
      } catch {
      }
    }
    let [keys2, get2] = getters(a);
    for (let k of keys2(a)) {
      values.push(get2(a, k), get2(b, k));
    }
  }
  return true;
}
function getters(object3) {
  if (object3 instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object3 instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a, b) {
  return a instanceof Date && (a > b || a < b);
}
function unequalBuffers(a, b) {
  return a.buffer instanceof ArrayBuffer && a.BYTES_PER_ELEMENT && !(a.byteLength === b.byteLength && a.every((n, i) => n === b[i]));
}
function unequalArrays(a, b) {
  return Array.isArray(a) && a.length !== b.length;
}
function unequalMaps(a, b) {
  return a instanceof Map && a.size !== b.size;
}
function unequalSets(a, b) {
  return a instanceof Set && (a.size != b.size || [...a].some((e) => !b.has(e)));
}
function unequalRegExps(a, b) {
  return a instanceof RegExp && (a.source !== b.source || a.flags !== b.flags);
}
function isObject(a) {
  return typeof a === "object" && a !== null;
}
function structurallyCompatibleObjects(a, b) {
  if (typeof a !== "object" && typeof b !== "object" && (!a || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a instanceof c))
    return false;
  return a.constructor === b.constructor;
}
function makeError(variant, module, line2, fn, message, extra) {
  let error = new globalThis.Error(message);
  error.gleam_error = variant;
  error.module = module;
  error.line = line2;
  error.fn = fn;
  for (let k in extra)
    error[k] = extra[k];
  return error;
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var Some = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var None = class extends CustomType {
};
function to_result(option, e) {
  if (option instanceof Some) {
    let a = option[0];
    return new Ok(a);
  } else {
    return new Error2(e);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
function do_reverse(loop$remaining, loop$accumulator) {
  while (true) {
    let remaining = loop$remaining;
    let accumulator = loop$accumulator;
    if (remaining.hasLength(0)) {
      return accumulator;
    } else {
      let item = remaining.head;
      let rest$1 = remaining.tail;
      loop$remaining = rest$1;
      loop$accumulator = prepend(item, accumulator);
    }
  }
}
function reverse(xs) {
  return do_reverse(xs, toList([]));
}
function do_filter_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      let new_acc = (() => {
        let $ = fun(x);
        if ($.isOk()) {
          let x$1 = $[0];
          return prepend(x$1, acc);
        } else {
          return acc;
        }
      })();
      loop$list = xs;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter_map(list, fun) {
  return do_filter_map(list, fun, toList([]));
}
function do_map(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let xs = list.tail;
      loop$list = xs;
      loop$fun = fun;
      loop$acc = prepend(fun(x), acc);
    }
  }
}
function map(list, fun) {
  return do_map(list, fun, toList([]));
}
function do_append(loop$first, loop$second) {
  while (true) {
    let first = loop$first;
    let second = loop$second;
    if (first.hasLength(0)) {
      return second;
    } else {
      let item = first.head;
      let rest$1 = first.tail;
      loop$first = rest$1;
      loop$second = prepend(item, second);
    }
  }
}
function append(first, second) {
  return do_append(reverse(first), second);
}
function do_intersperse(loop$list, loop$separator, loop$acc) {
  while (true) {
    let list = loop$list;
    let separator = loop$separator;
    let acc = loop$acc;
    if (list.hasLength(0)) {
      return reverse(acc);
    } else {
      let x = list.head;
      let rest$1 = list.tail;
      loop$list = rest$1;
      loop$separator = separator;
      loop$acc = prepend(x, prepend(separator, acc));
    }
  }
}
function intersperse(list, elem) {
  if (list.hasLength(0)) {
    return list;
  } else if (list.hasLength(1)) {
    return list;
  } else {
    let x = list.head;
    let rest$1 = list.tail;
    return do_intersperse(rest$1, elem, toList([x]));
  }
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function map2(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(fun(x));
  } else {
    let e = result[0];
    return new Error2(e);
  }
}
function map_error(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return new Ok(x);
  } else {
    let error = result[0];
    return new Error2(fun(error));
  }
}
function try$(result, fun) {
  if (result.isOk()) {
    let x = result[0];
    return fun(x);
  } else {
    let e = result[0];
    return new Error2(e);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/string_builder.mjs
function from_strings(strings) {
  return concat(strings);
}
function from_string(string3) {
  return identity(string3);
}
function to_string(builder) {
  return identity(builder);
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic.mjs
var DecodeError = class extends CustomType {
  constructor(expected, found, path) {
    super();
    this.expected = expected;
    this.found = found;
    this.path = path;
  }
};
function from(a) {
  return identity(a);
}
function string(data) {
  return decode_string(data);
}
function classify(data) {
  return classify_dynamic(data);
}
function int(data) {
  return decode_int(data);
}
function any(decoders) {
  return (data) => {
    if (decoders.hasLength(0)) {
      return new Error2(
        toList([new DecodeError("another type", classify(data), toList([]))])
      );
    } else {
      let decoder = decoders.head;
      let decoders$1 = decoders.tail;
      let $ = decoder(data);
      if ($.isOk()) {
        let decoded = $[0];
        return new Ok(decoded);
      } else {
        return any(decoders$1)(data);
      }
    }
  };
}
function push_path(error, name) {
  let name$1 = from(name);
  let decoder = any(
    toList([string, (x) => {
      return map2(int(x), to_string2);
    }])
  );
  let name$2 = (() => {
    let $ = decoder(name$1);
    if ($.isOk()) {
      let name$22 = $[0];
      return name$22;
    } else {
      let _pipe = toList(["<", classify(name$1), ">"]);
      let _pipe$1 = from_strings(_pipe);
      return to_string(_pipe$1);
    }
  })();
  return error.withFields({ path: prepend(name$2, error.path) });
}
function map_errors(result, f) {
  return map_error(
    result,
    (_capture) => {
      return map(_capture, f);
    }
  );
}
function field(name, inner_type) {
  return (value2) => {
    let missing_field_error = new DecodeError("field", "nothing", toList([]));
    return try$(
      decode_field(value2, name),
      (maybe_inner) => {
        let _pipe = maybe_inner;
        let _pipe$1 = to_result(_pipe, toList([missing_field_error]));
        let _pipe$2 = try$(_pipe$1, inner_type);
        return map_errors(
          _pipe$2,
          (_capture) => {
            return push_path(_capture, name);
          }
        );
      }
    );
  };
}

// build/dev/javascript/gleam_stdlib/dict.mjs
var referenceMap = /* @__PURE__ */ new WeakMap();
var tempDataView = new DataView(new ArrayBuffer(8));
var referenceUID = 0;
function hashByReference(o) {
  const known = referenceMap.get(o);
  if (known !== void 0) {
    return known;
  }
  const hash = referenceUID++;
  if (referenceUID === 2147483647) {
    referenceUID = 0;
  }
  referenceMap.set(o, hash);
  return hash;
}
function hashMerge(a, b) {
  return a ^ b + 2654435769 + (a << 6) + (a >> 2) | 0;
}
function hashString(s) {
  let hash = 0;
  const len = s.length;
  for (let i = 0; i < len; i++) {
    hash = Math.imul(31, hash) + s.charCodeAt(i) | 0;
  }
  return hash;
}
function hashNumber(n) {
  tempDataView.setFloat64(0, n);
  const i = tempDataView.getInt32(0);
  const j = tempDataView.getInt32(4);
  return Math.imul(73244475, i >> 16 ^ i) ^ j;
}
function hashBigInt(n) {
  return hashString(n.toString());
}
function hashObject(o) {
  const proto = Object.getPrototypeOf(o);
  if (proto !== null && typeof proto.hashCode === "function") {
    try {
      const code = o.hashCode(o);
      if (typeof code === "number") {
        return code;
      }
    } catch {
    }
  }
  if (o instanceof Promise || o instanceof WeakSet || o instanceof WeakMap) {
    return hashByReference(o);
  }
  if (o instanceof Date) {
    return hashNumber(o.getTime());
  }
  let h = 0;
  if (o instanceof ArrayBuffer) {
    o = new Uint8Array(o);
  }
  if (Array.isArray(o) || o instanceof Uint8Array) {
    for (let i = 0; i < o.length; i++) {
      h = Math.imul(31, h) + getHash(o[i]) | 0;
    }
  } else if (o instanceof Set) {
    o.forEach((v) => {
      h = h + getHash(v) | 0;
    });
  } else if (o instanceof Map) {
    o.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
  } else {
    const keys2 = Object.keys(o);
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      const v = o[k];
      h = h + hashMerge(getHash(v), hashString(k)) | 0;
    }
  }
  return h;
}
function getHash(u) {
  if (u === null)
    return 1108378658;
  if (u === void 0)
    return 1108378659;
  if (u === true)
    return 1108378657;
  if (u === false)
    return 1108378656;
  switch (typeof u) {
    case "number":
      return hashNumber(u);
    case "string":
      return hashString(u);
    case "bigint":
      return hashBigInt(u);
    case "object":
      return hashObject(u);
    case "symbol":
      return hashByReference(u);
    case "function":
      return hashByReference(u);
    default:
      return 0;
  }
}
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;
var ENTRY = 0;
var ARRAY_NODE = 1;
var INDEX_NODE = 2;
var COLLISION_NODE = 3;
var EMPTY = {
  type: INDEX_NODE,
  bitmap: 0,
  array: []
};
function mask(hash, shift) {
  return hash >>> shift & MASK;
}
function bitpos(hash, shift) {
  return 1 << mask(hash, shift);
}
function bitcount(x) {
  x -= x >> 1 & 1431655765;
  x = (x & 858993459) + (x >> 2 & 858993459);
  x = x + (x >> 4) & 252645135;
  x += x >> 8;
  x += x >> 16;
  return x & 127;
}
function index(bitmap, bit) {
  return bitcount(bitmap & bit - 1);
}
function cloneAndSet(arr, at, val) {
  const len = arr.length;
  const out = new Array(len);
  for (let i = 0; i < len; ++i) {
    out[i] = arr[i];
  }
  out[at] = val;
  return out;
}
function spliceIn(arr, at, val) {
  const len = arr.length;
  const out = new Array(len + 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  out[g++] = val;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function spliceOut(arr, at) {
  const len = arr.length;
  const out = new Array(len - 1);
  let i = 0;
  let g = 0;
  while (i < at) {
    out[g++] = arr[i++];
  }
  ++i;
  while (i < len) {
    out[g++] = arr[i++];
  }
  return out;
}
function createNode(shift, key1, val1, key2hash, key2, val2) {
  const key1hash = getHash(key1);
  if (key1hash === key2hash) {
    return {
      type: COLLISION_NODE,
      hash: key1hash,
      array: [
        { type: ENTRY, k: key1, v: val1 },
        { type: ENTRY, k: key2, v: val2 }
      ]
    };
  }
  const addedLeaf = { val: false };
  return assoc(
    assocIndex(EMPTY, shift, key1hash, key1, val1, addedLeaf),
    shift,
    key2hash,
    key2,
    val2,
    addedLeaf
  );
}
function assoc(root2, shift, hash, key, val, addedLeaf) {
  switch (root2.type) {
    case ARRAY_NODE:
      return assocArray(root2, shift, hash, key, val, addedLeaf);
    case INDEX_NODE:
      return assocIndex(root2, shift, hash, key, val, addedLeaf);
    case COLLISION_NODE:
      return assocCollision(root2, shift, hash, key, val, addedLeaf);
  }
}
function assocArray(root2, shift, hash, key, val, addedLeaf) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root2.size + 1,
      array: cloneAndSet(root2.array, idx, { type: ENTRY, k: key, v: val })
    };
  }
  if (node.type === ENTRY) {
    if (isEqual(key, node.k)) {
      if (val === node.v) {
        return root2;
      }
      return {
        type: ARRAY_NODE,
        size: root2.size,
        array: cloneAndSet(root2.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: ARRAY_NODE,
      size: root2.size,
      array: cloneAndSet(
        root2.array,
        idx,
        createNode(shift + SHIFT, node.k, node.v, hash, key, val)
      )
    };
  }
  const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
  if (n === node) {
    return root2;
  }
  return {
    type: ARRAY_NODE,
    size: root2.size,
    array: cloneAndSet(root2.array, idx, n)
  };
}
function assocIndex(root2, shift, hash, key, val, addedLeaf) {
  const bit = bitpos(hash, shift);
  const idx = index(root2.bitmap, bit);
  if ((root2.bitmap & bit) !== 0) {
    const node = root2.array[idx];
    if (node.type !== ENTRY) {
      const n = assoc(node, shift + SHIFT, hash, key, val, addedLeaf);
      if (n === node) {
        return root2;
      }
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, n)
      };
    }
    const nodeKey = node.k;
    if (isEqual(key, nodeKey)) {
      if (val === node.v) {
        return root2;
      }
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, {
          type: ENTRY,
          k: key,
          v: val
        })
      };
    }
    addedLeaf.val = true;
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap,
      array: cloneAndSet(
        root2.array,
        idx,
        createNode(shift + SHIFT, nodeKey, node.v, hash, key, val)
      )
    };
  } else {
    const n = root2.array.length;
    if (n >= MAX_INDEX_NODE) {
      const nodes = new Array(32);
      const jdx = mask(hash, shift);
      nodes[jdx] = assocIndex(EMPTY, shift + SHIFT, hash, key, val, addedLeaf);
      let j = 0;
      let bitmap = root2.bitmap;
      for (let i = 0; i < 32; i++) {
        if ((bitmap & 1) !== 0) {
          const node = root2.array[j++];
          nodes[i] = node;
        }
        bitmap = bitmap >>> 1;
      }
      return {
        type: ARRAY_NODE,
        size: n + 1,
        array: nodes
      };
    } else {
      const newArray = spliceIn(root2.array, idx, {
        type: ENTRY,
        k: key,
        v: val
      });
      addedLeaf.val = true;
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap | bit,
        array: newArray
      };
    }
  }
}
function assocCollision(root2, shift, hash, key, val, addedLeaf) {
  if (hash === root2.hash) {
    const idx = collisionIndexOf(root2, key);
    if (idx !== -1) {
      const entry = root2.array[idx];
      if (entry.v === val) {
        return root2;
      }
      return {
        type: COLLISION_NODE,
        hash,
        array: cloneAndSet(root2.array, idx, { type: ENTRY, k: key, v: val })
      };
    }
    const size = root2.array.length;
    addedLeaf.val = true;
    return {
      type: COLLISION_NODE,
      hash,
      array: cloneAndSet(root2.array, size, { type: ENTRY, k: key, v: val })
    };
  }
  return assoc(
    {
      type: INDEX_NODE,
      bitmap: bitpos(root2.hash, shift),
      array: [root2]
    },
    shift,
    hash,
    key,
    val,
    addedLeaf
  );
}
function collisionIndexOf(root2, key) {
  const size = root2.array.length;
  for (let i = 0; i < size; i++) {
    if (isEqual(key, root2.array[i].k)) {
      return i;
    }
  }
  return -1;
}
function find(root2, shift, hash, key) {
  switch (root2.type) {
    case ARRAY_NODE:
      return findArray(root2, shift, hash, key);
    case INDEX_NODE:
      return findIndex(root2, shift, hash, key);
    case COLLISION_NODE:
      return findCollision(root2, key);
  }
}
function findArray(root2, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    return void 0;
  }
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findIndex(root2, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root2.bitmap & bit) === 0) {
    return void 0;
  }
  const idx = index(root2.bitmap, bit);
  const node = root2.array[idx];
  if (node.type !== ENTRY) {
    return find(node, shift + SHIFT, hash, key);
  }
  if (isEqual(key, node.k)) {
    return node;
  }
  return void 0;
}
function findCollision(root2, key) {
  const idx = collisionIndexOf(root2, key);
  if (idx < 0) {
    return void 0;
  }
  return root2.array[idx];
}
function without(root2, shift, hash, key) {
  switch (root2.type) {
    case ARRAY_NODE:
      return withoutArray(root2, shift, hash, key);
    case INDEX_NODE:
      return withoutIndex(root2, shift, hash, key);
    case COLLISION_NODE:
      return withoutCollision(root2, key);
  }
}
function withoutArray(root2, shift, hash, key) {
  const idx = mask(hash, shift);
  const node = root2.array[idx];
  if (node === void 0) {
    return root2;
  }
  let n = void 0;
  if (node.type === ENTRY) {
    if (!isEqual(node.k, key)) {
      return root2;
    }
  } else {
    n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root2;
    }
  }
  if (n === void 0) {
    if (root2.size <= MIN_ARRAY_NODE) {
      const arr = root2.array;
      const out = new Array(root2.size - 1);
      let i = 0;
      let j = 0;
      let bitmap = 0;
      while (i < idx) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      ++i;
      while (i < arr.length) {
        const nv = arr[i];
        if (nv !== void 0) {
          out[j] = nv;
          bitmap |= 1 << i;
          ++j;
        }
        ++i;
      }
      return {
        type: INDEX_NODE,
        bitmap,
        array: out
      };
    }
    return {
      type: ARRAY_NODE,
      size: root2.size - 1,
      array: cloneAndSet(root2.array, idx, n)
    };
  }
  return {
    type: ARRAY_NODE,
    size: root2.size,
    array: cloneAndSet(root2.array, idx, n)
  };
}
function withoutIndex(root2, shift, hash, key) {
  const bit = bitpos(hash, shift);
  if ((root2.bitmap & bit) === 0) {
    return root2;
  }
  const idx = index(root2.bitmap, bit);
  const node = root2.array[idx];
  if (node.type !== ENTRY) {
    const n = without(node, shift + SHIFT, hash, key);
    if (n === node) {
      return root2;
    }
    if (n !== void 0) {
      return {
        type: INDEX_NODE,
        bitmap: root2.bitmap,
        array: cloneAndSet(root2.array, idx, n)
      };
    }
    if (root2.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap ^ bit,
      array: spliceOut(root2.array, idx)
    };
  }
  if (isEqual(key, node.k)) {
    if (root2.bitmap === bit) {
      return void 0;
    }
    return {
      type: INDEX_NODE,
      bitmap: root2.bitmap ^ bit,
      array: spliceOut(root2.array, idx)
    };
  }
  return root2;
}
function withoutCollision(root2, key) {
  const idx = collisionIndexOf(root2, key);
  if (idx < 0) {
    return root2;
  }
  if (root2.array.length === 1) {
    return void 0;
  }
  return {
    type: COLLISION_NODE,
    hash: root2.hash,
    array: spliceOut(root2.array, idx)
  };
}
function forEach(root2, fn) {
  if (root2 === void 0) {
    return;
  }
  const items = root2.array;
  const size = items.length;
  for (let i = 0; i < size; i++) {
    const item = items[i];
    if (item === void 0) {
      continue;
    }
    if (item.type === ENTRY) {
      fn(item.v, item.k);
      continue;
    }
    forEach(item, fn);
  }
}
var Dict = class _Dict {
  /**
   * @template V
   * @param {Record<string,V>} o
   * @returns {Dict<string,V>}
   */
  static fromObject(o) {
    const keys2 = Object.keys(o);
    let m = _Dict.new();
    for (let i = 0; i < keys2.length; i++) {
      const k = keys2[i];
      m = m.set(k, o[k]);
    }
    return m;
  }
  /**
   * @template K,V
   * @param {Map<K,V>} o
   * @returns {Dict<K,V>}
   */
  static fromMap(o) {
    let m = _Dict.new();
    o.forEach((v, k) => {
      m = m.set(k, v);
    });
    return m;
  }
  static new() {
    return new _Dict(void 0, 0);
  }
  /**
   * @param {undefined | Node<K,V>} root
   * @param {number} size
   */
  constructor(root2, size) {
    this.root = root2;
    this.size = size;
  }
  /**
   * @template NotFound
   * @param {K} key
   * @param {NotFound} notFound
   * @returns {NotFound | V}
   */
  get(key, notFound) {
    if (this.root === void 0) {
      return notFound;
    }
    const found = find(this.root, 0, getHash(key), key);
    if (found === void 0) {
      return notFound;
    }
    return found.v;
  }
  /**
   * @param {K} key
   * @param {V} val
   * @returns {Dict<K,V>}
   */
  set(key, val) {
    const addedLeaf = { val: false };
    const root2 = this.root === void 0 ? EMPTY : this.root;
    const newRoot = assoc(root2, 0, getHash(key), key, val, addedLeaf);
    if (newRoot === this.root) {
      return this;
    }
    return new _Dict(newRoot, addedLeaf.val ? this.size + 1 : this.size);
  }
  /**
   * @param {K} key
   * @returns {Dict<K,V>}
   */
  delete(key) {
    if (this.root === void 0) {
      return this;
    }
    const newRoot = without(this.root, 0, getHash(key), key);
    if (newRoot === this.root) {
      return this;
    }
    if (newRoot === void 0) {
      return _Dict.new();
    }
    return new _Dict(newRoot, this.size - 1);
  }
  /**
   * @param {K} key
   * @returns {boolean}
   */
  has(key) {
    if (this.root === void 0) {
      return false;
    }
    return find(this.root, 0, getHash(key), key) !== void 0;
  }
  /**
   * @returns {[K,V][]}
   */
  entries() {
    if (this.root === void 0) {
      return [];
    }
    const result = [];
    this.forEach((v, k) => result.push([k, v]));
    return result;
  }
  /**
   *
   * @param {(val:V,key:K)=>void} fn
   */
  forEach(fn) {
    forEach(this.root, fn);
  }
  hashCode() {
    let h = 0;
    this.forEach((v, k) => {
      h = h + hashMerge(getHash(v), getHash(k)) | 0;
    });
    return h;
  }
  /**
   * @param {unknown} o
   * @returns {boolean}
   */
  equals(o) {
    if (!(o instanceof _Dict) || this.size !== o.size) {
      return false;
    }
    let equal = true;
    this.forEach((v, k) => {
      equal = equal && isEqual(o.get(k, !v), v);
    });
    return equal;
  }
};

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
var Nil = void 0;
var NOT_FOUND = {};
function identity(x) {
  return x;
}
function to_string3(term) {
  return term.toString();
}
function string_replace(string3, target, substitute) {
  if (typeof string3.replaceAll !== "undefined") {
    return string3.replaceAll(target, substitute);
  }
  return string3.replace(
    // $& means the whole matched string
    new RegExp(target.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    substitute
  );
}
function string_length(string3) {
  if (string3 === "") {
    return 0;
  }
  const iterator = graphemes_iterator(string3);
  if (iterator) {
    let i = 0;
    for (const _ of iterator) {
      i++;
    }
    return i;
  } else {
    return string3.match(/./gsu).length;
  }
}
function graphemes_iterator(string3) {
  if (Intl && Intl.Segmenter) {
    return new Intl.Segmenter().segment(string3)[Symbol.iterator]();
  }
}
function lowercase(string3) {
  return string3.toLowerCase();
}
function concat(xs) {
  let result = "";
  for (const x of xs) {
    result = result + x;
  }
  return result;
}
function contains_string(haystack, needle) {
  return haystack.indexOf(needle) >= 0;
}
function trim_left(string3) {
  return string3.trimLeft();
}
function map_get(map4, key) {
  const value2 = map4.get(key, NOT_FOUND);
  if (value2 === NOT_FOUND) {
    return new Error2(Nil);
  }
  return new Ok(value2);
}
function classify_dynamic(data) {
  if (typeof data === "string") {
    return "String";
  } else if (typeof data === "boolean") {
    return "Bool";
  } else if (data instanceof Result) {
    return "Result";
  } else if (data instanceof List) {
    return "List";
  } else if (data instanceof BitArray) {
    return "BitArray";
  } else if (data instanceof Dict) {
    return "Dict";
  } else if (Number.isInteger(data)) {
    return "Int";
  } else if (Array.isArray(data)) {
    return `Tuple of ${data.length} elements`;
  } else if (typeof data === "number") {
    return "Float";
  } else if (data === null) {
    return "Null";
  } else if (data === void 0) {
    return "Nil";
  } else {
    const type = typeof data;
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
}
function decoder_error(expected, got) {
  return decoder_error_no_classify(expected, classify_dynamic(got));
}
function decoder_error_no_classify(expected, got) {
  return new Error2(
    List.fromArray([new DecodeError(expected, got, List.fromArray([]))])
  );
}
function decode_string(data) {
  return typeof data === "string" ? new Ok(data) : decoder_error("String", data);
}
function decode_int(data) {
  return Number.isInteger(data) ? new Ok(data) : decoder_error("Int", data);
}
function decode_field(value2, name) {
  const not_a_map_error = () => decoder_error("Dict", value2);
  if (value2 instanceof Dict || value2 instanceof WeakMap || value2 instanceof Map) {
    const entry = map_get(value2, name);
    return new Ok(entry.isOk() ? new Some(entry[0]) : new None());
  } else if (value2 === null) {
    return not_a_map_error();
  } else if (Object.getPrototypeOf(value2) == Object.prototype) {
    return try_get_field(value2, name, () => new Ok(new None()));
  } else {
    return try_get_field(value2, name, not_a_map_error);
  }
}
function try_get_field(value2, field2, or_else) {
  try {
    return field2 in value2 ? new Ok(new Some(value2[field2])) : or_else();
  } catch {
    return or_else();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/int.mjs
function to_string2(x) {
  return to_string3(x);
}

// build/dev/javascript/gleam_stdlib/gleam/iterator.mjs
var Stop = class extends CustomType {
};
var Continue2 = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};
var Iterator = class extends CustomType {
  constructor(continuation) {
    super();
    this.continuation = continuation;
  }
};
var Next = class extends CustomType {
  constructor(element2, accumulator) {
    super();
    this.element = element2;
    this.accumulator = accumulator;
  }
};
function do_unfold(initial, f) {
  return () => {
    let $ = f(initial);
    if ($ instanceof Next) {
      let x = $.element;
      let acc = $.accumulator;
      return new Continue2(x, do_unfold(acc, f));
    } else {
      return new Stop();
    }
  };
}
function unfold(initial, f) {
  let _pipe = initial;
  let _pipe$1 = do_unfold(_pipe, f);
  return new Iterator(_pipe$1);
}
function repeatedly(f) {
  return unfold(void 0, (_) => {
    return new Next(f(), void 0);
  });
}
function repeat(x) {
  return repeatedly(() => {
    return x;
  });
}
function do_fold(loop$continuation, loop$f, loop$accumulator) {
  while (true) {
    let continuation = loop$continuation;
    let f = loop$f;
    let accumulator = loop$accumulator;
    let $ = continuation();
    if ($ instanceof Continue2) {
      let elem = $[0];
      let next = $[1];
      loop$continuation = next;
      loop$f = f;
      loop$accumulator = f(accumulator, elem);
    } else {
      return accumulator;
    }
  }
}
function fold(iterator, initial, f) {
  let _pipe = iterator.continuation;
  return do_fold(_pipe, f, initial);
}
function to_list(iterator) {
  let _pipe = iterator;
  let _pipe$1 = fold(
    _pipe,
    toList([]),
    (acc, e) => {
      return prepend(e, acc);
    }
  );
  return reverse(_pipe$1);
}
function do_take(continuation, desired) {
  return () => {
    let $ = desired > 0;
    if (!$) {
      return new Stop();
    } else {
      let $1 = continuation();
      if ($1 instanceof Stop) {
        return new Stop();
      } else {
        let e = $1[0];
        let next = $1[1];
        return new Continue2(e, do_take(next, desired - 1));
      }
    }
  };
}
function take(iterator, desired) {
  let _pipe = iterator.continuation;
  let _pipe$1 = do_take(_pipe, desired);
  return new Iterator(_pipe$1);
}

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function length2(string3) {
  return string_length(string3);
}
function replace(string3, pattern, substitute) {
  let _pipe = string3;
  let _pipe$1 = from_string(_pipe);
  let _pipe$2 = string_replace(_pipe$1, pattern, substitute);
  return to_string(_pipe$2);
}
function lowercase2(string3) {
  return lowercase(string3);
}
function concat3(strings) {
  let _pipe = strings;
  let _pipe$1 = from_strings(_pipe);
  return to_string(_pipe$1);
}
function repeat2(string3, times) {
  let _pipe = repeat(string3);
  let _pipe$1 = take(_pipe, times);
  let _pipe$2 = to_list(_pipe$1);
  return concat3(_pipe$2);
}
function trim_left2(string3) {
  return trim_left(string3);
}

// build/dev/javascript/glam/glam/doc.mjs
var Line = class extends CustomType {
  constructor(size) {
    super();
    this.size = size;
  }
};
var Concat = class extends CustomType {
  constructor(docs) {
    super();
    this.docs = docs;
  }
};
var Text = class extends CustomType {
  constructor(text2, length3) {
    super();
    this.text = text2;
    this.length = length3;
  }
};
var Nest = class extends CustomType {
  constructor(doc, indentation2) {
    super();
    this.doc = doc;
    this.indentation = indentation2;
  }
};
var ForceBreak = class extends CustomType {
  constructor(doc) {
    super();
    this.doc = doc;
  }
};
var Break = class extends CustomType {
  constructor(unbroken, broken) {
    super();
    this.unbroken = unbroken;
    this.broken = broken;
  }
};
var FlexBreak = class extends CustomType {
  constructor(unbroken, broken) {
    super();
    this.unbroken = unbroken;
    this.broken = broken;
  }
};
var Group = class extends CustomType {
  constructor(doc) {
    super();
    this.doc = doc;
  }
};
var Broken = class extends CustomType {
};
var ForceBroken = class extends CustomType {
};
var Unbroken = class extends CustomType {
};
function append4(first, second) {
  if (first instanceof Concat) {
    let docs = first.docs;
    return new Concat(append(docs, toList([second])));
  } else {
    return new Concat(toList([first, second]));
  }
}
function break$(unbroken, broken) {
  return new Break(unbroken, broken);
}
function concat4(docs) {
  return new Concat(docs);
}
function from_string2(string3) {
  return new Text(string3, length2(string3));
}
function group(doc) {
  return new Group(doc);
}
function join2(docs, separator) {
  return concat4(intersperse(docs, separator));
}
function nest(doc, indentation2) {
  return new Nest(doc, indentation2);
}
function prepend2(first, second) {
  if (first instanceof Concat) {
    let docs = first.docs;
    return new Concat(prepend(second, docs));
  } else {
    return new Concat(toList([second, first]));
  }
}
function fits(loop$docs, loop$max_width, loop$current_width) {
  while (true) {
    let docs = loop$docs;
    let max_width = loop$max_width;
    let current_width = loop$current_width;
    if (current_width > max_width) {
      return false;
    } else if (docs.hasLength(0)) {
      return true;
    } else {
      let indent = docs.head[0];
      let mode = docs.head[1];
      let doc = docs.head[2];
      let rest = docs.tail;
      if (doc instanceof Line) {
        return true;
      } else if (doc instanceof ForceBreak) {
        return false;
      } else if (doc instanceof Text) {
        let length3 = doc.length;
        loop$docs = rest;
        loop$max_width = max_width;
        loop$current_width = current_width + length3;
      } else if (doc instanceof Nest) {
        let doc$1 = doc.doc;
        let i = doc.indentation;
        let _pipe = prepend([indent + i, mode, doc$1], rest);
        loop$docs = _pipe;
        loop$max_width = max_width;
        loop$current_width = current_width;
      } else if (doc instanceof Break) {
        let unbroken = doc.unbroken;
        if (mode instanceof Broken) {
          return true;
        } else if (mode instanceof ForceBroken) {
          return true;
        } else {
          loop$docs = rest;
          loop$max_width = max_width;
          loop$current_width = current_width + length2(unbroken);
        }
      } else if (doc instanceof FlexBreak) {
        let unbroken = doc.unbroken;
        if (mode instanceof Broken) {
          return true;
        } else if (mode instanceof ForceBroken) {
          return true;
        } else {
          loop$docs = rest;
          loop$max_width = max_width;
          loop$current_width = current_width + length2(unbroken);
        }
      } else if (doc instanceof Group) {
        let doc$1 = doc.doc;
        loop$docs = prepend([indent, mode, doc$1], rest);
        loop$max_width = max_width;
        loop$current_width = current_width;
      } else {
        let docs$1 = doc.docs;
        let _pipe = map(docs$1, (doc2) => {
          return [indent, mode, doc2];
        });
        let _pipe$1 = append(_pipe, rest);
        loop$docs = _pipe$1;
        loop$max_width = max_width;
        loop$current_width = current_width;
      }
    }
  }
}
function indentation(size) {
  return repeat2(" ", size);
}
function do_to_string(loop$acc, loop$max_width, loop$current_width, loop$docs) {
  while (true) {
    let acc = loop$acc;
    let max_width = loop$max_width;
    let current_width = loop$current_width;
    let docs = loop$docs;
    if (docs.hasLength(0)) {
      return acc;
    } else {
      let indent = docs.head[0];
      let mode = docs.head[1];
      let doc = docs.head[2];
      let rest = docs.tail;
      if (doc instanceof Line) {
        let size = doc.size;
        let _pipe = acc + repeat2("\n", size) + indentation(indent);
        loop$acc = _pipe;
        loop$max_width = max_width;
        loop$current_width = indent;
        loop$docs = rest;
      } else if (doc instanceof FlexBreak) {
        let unbroken = doc.unbroken;
        let broken = doc.broken;
        let new_unbroken_width = current_width + length2(unbroken);
        let $ = fits(rest, max_width, new_unbroken_width);
        if ($) {
          let _pipe = acc + unbroken;
          loop$acc = _pipe;
          loop$max_width = max_width;
          loop$current_width = new_unbroken_width;
          loop$docs = rest;
        } else {
          let _pipe = acc + broken + "\n" + indentation(indent);
          loop$acc = _pipe;
          loop$max_width = max_width;
          loop$current_width = indent;
          loop$docs = rest;
        }
      } else if (doc instanceof Break) {
        let unbroken = doc.unbroken;
        let broken = doc.broken;
        if (mode instanceof Unbroken) {
          let new_width = current_width + length2(unbroken);
          loop$acc = acc + unbroken;
          loop$max_width = max_width;
          loop$current_width = new_width;
          loop$docs = rest;
        } else if (mode instanceof Broken) {
          let _pipe = acc + broken + "\n" + indentation(indent);
          loop$acc = _pipe;
          loop$max_width = max_width;
          loop$current_width = indent;
          loop$docs = rest;
        } else {
          let _pipe = acc + broken + "\n" + indentation(indent);
          loop$acc = _pipe;
          loop$max_width = max_width;
          loop$current_width = indent;
          loop$docs = rest;
        }
      } else if (doc instanceof ForceBreak) {
        let doc$1 = doc.doc;
        let docs$1 = prepend([indent, new ForceBroken(), doc$1], rest);
        loop$acc = acc;
        loop$max_width = max_width;
        loop$current_width = current_width;
        loop$docs = docs$1;
      } else if (doc instanceof Concat) {
        let docs$1 = doc.docs;
        let docs$2 = (() => {
          let _pipe = map(
            docs$1,
            (doc2) => {
              return [indent, mode, doc2];
            }
          );
          return append(_pipe, rest);
        })();
        loop$acc = acc;
        loop$max_width = max_width;
        loop$current_width = current_width;
        loop$docs = docs$2;
      } else if (doc instanceof Group) {
        let doc$1 = doc.doc;
        let fits$1 = fits(
          toList([[indent, new Unbroken(), doc$1]]),
          max_width,
          current_width
        );
        let new_mode = (() => {
          if (fits$1) {
            return new Unbroken();
          } else {
            return new Broken();
          }
        })();
        let docs$1 = prepend([indent, new_mode, doc$1], rest);
        loop$acc = acc;
        loop$max_width = max_width;
        loop$current_width = current_width;
        loop$docs = docs$1;
      } else if (doc instanceof Nest) {
        let doc$1 = doc.doc;
        let i = doc.indentation;
        let docs$1 = prepend([indent + i, mode, doc$1], rest);
        loop$acc = acc;
        loop$max_width = max_width;
        loop$current_width = current_width;
        loop$docs = docs$1;
      } else {
        let text2 = doc.text;
        let length3 = doc.length;
        loop$acc = acc + text2;
        loop$max_width = max_width;
        loop$current_width = current_width + length3;
        loop$docs = rest;
      }
    }
  }
}
function to_string4(doc, limit) {
  return do_to_string("", limit, 0, toList([[0, new Unbroken(), doc]]));
}
var empty = new Concat(toList([]));
var flex_space = new FlexBreak(" ", "");
var line = new Line(1);
var soft_break = new Break("", "");
var space = new Break(" ", "");

// build/dev/javascript/javascript_dom_parser/javascript_dom_parser_ffi.mjs
function parse(html) {
  return new DOMParser().parseFromString(html, "text/html").documentElement;
}
function toRecords(element2) {
  switch (element2.nodeType) {
    case element2.ELEMENT_NODE:
      const children = List.fromArray(
        Array.from(element2.childNodes).map(toRecords)
      );
      return new Element(element2.tagName, attributes(element2), children);
    case element2.TEXT_NODE:
      return new Text2(element2.textContent);
    case element2.COMMENT_NODE:
      return new Comment(element2.textContent);
    default:
      throw new Error("Unexpected node " + element2);
  }
}
function attributes(element2) {
  let attributes2 = new Empty();
  for (const attribute2 of element2.attributes) {
    attributes2 = new NonEmpty([attribute2.name, attribute2.value], attributes2);
  }
  return attributes2;
}

// build/dev/javascript/javascript_dom_parser/javascript_dom_parser.mjs
var Element = class extends CustomType {
  constructor(tag, attributes2, children) {
    super();
    this.tag = tag;
    this.attributes = attributes2;
    this.children = children;
  }
};
var Text2 = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Comment = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function parse_to_records(html) {
  let _pipe = html;
  let _pipe$1 = parse(_pipe);
  return toRecords(_pipe$1);
}

// build/dev/javascript/html_lustre_converter/html_lustre_converter.mjs
var PreserveWhitespace = class extends CustomType {
};
var StripWhitespace = class extends CustomType {
};
function strip_body_wrapper(html, source) {
  let full_page = contains_string(source, "<head>");
  if (html instanceof Element && html.tag === "HTML" && html.attributes.hasLength(0) && html.children.hasLength(2) && html.children.head instanceof Element && html.children.head.tag === "HEAD" && html.children.head.attributes.hasLength(0) && html.children.head.children.hasLength(0) && html.children.tail.head instanceof Element && html.children.tail.head.tag === "BODY" && html.children.tail.head.attributes.hasLength(0) && !full_page) {
    let nodes = html.children.tail.head.children;
    return nodes;
  } else {
    return toList([html]);
  }
}
function print_string(t) {
  return '"' + replace(t, '"', '\\"') + '"';
}
function print_text(t) {
  return from_string2("text(" + print_string(t) + ")");
}
function get_text_content(nodes) {
  let _pipe = filter_map(
    nodes,
    (node) => {
      if (node instanceof Text2) {
        let t = node[0];
        return new Ok(t);
      } else {
        return new Error2(void 0);
      }
    }
  );
  return concat3(_pipe);
}
function wrap(items, open, close) {
  let comma = concat4(toList([from_string2(","), space]));
  let open$1 = concat4(toList([from_string2(open), soft_break]));
  let trailing_comma = break$("", ",");
  let close$1 = concat4(toList([trailing_comma, from_string2(close)]));
  let _pipe = items;
  let _pipe$1 = join2(_pipe, comma);
  let _pipe$2 = prepend2(_pipe$1, open$1);
  let _pipe$3 = nest(_pipe$2, 2);
  let _pipe$4 = append4(_pipe$3, close$1);
  return group(_pipe$4);
}
function print_attribute(attribute2) {
  let $ = attribute2[0];
  if ($ === "action") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "alt") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "attribute") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "autocomplete") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "class") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "download") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "enctype") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "for") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "form_action") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "form_enctype") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "form_method") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "form_target") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "href") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "id") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "map") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "max") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "method") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "min") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "msg") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "name") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "none") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "on") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "pattern") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "placeholder") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "rel") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "role") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "src") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "step") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "target") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "value") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "wrap") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "type") {
    return from_string2(
      "attribute.type_(" + print_string(attribute2[1]) + ")"
    );
  } else if ($ === "checked") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "controls") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "disabled") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "form_novalidate") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "loop") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "novalidate") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "readonly") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "required") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "selected") {
    return from_string2("attribute." + attribute2[0] + "(True)");
  } else if ($ === "width") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + attribute2[1] + ")"
    );
  } else if ($ === "height") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + attribute2[1] + ")"
    );
  } else if ($ === "cols") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + attribute2[1] + ")"
    );
  } else if ($ === "rows") {
    return from_string2(
      "attribute." + attribute2[0] + "(" + attribute2[1] + ")"
    );
  } else {
    let children = toList([
      from_string2(print_string(attribute2[0])),
      from_string2(print_string(attribute2[1]))
    ]);
    let _pipe = from_string2("attribute");
    return append4(_pipe, wrap(children, "(", ")"));
  }
}
function print_element(tag, attributes2, children, ws) {
  let tag$1 = lowercase2(tag);
  let attributes$1 = (() => {
    let _pipe = map(attributes2, print_attribute);
    return wrap(_pipe, "[", "]");
  })();
  if (tag$1 === "area") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "base") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "br") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "col") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "embed") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "hr") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "img") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "input") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "link") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "meta") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "param") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "source") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "track") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "wbr") {
    let _pipe = from_string2("html." + tag$1 + "(");
    let _pipe$1 = append4(_pipe, attributes$1);
    return append4(_pipe$1, from_string2(")"));
  } else if (tag$1 === "a") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "abbr") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "address") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "article") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "aside") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "audio") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "b") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "bdi") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "bdo") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "blockquote") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "body") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "button") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "canvas") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "caption") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "cite") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "code") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "colgroup") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "data") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "datalist") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "dd") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "del") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "details") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "dfn") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "dialog") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "div") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "dl") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "dt") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "em") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "fieldset") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "figcaption") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "figure") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "footer") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "form") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "h1") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "h2") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "h3") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "h4") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "h5") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "h6") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "head") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "header") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "hgroup") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "html") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "i") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "iframe") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "ins") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "kbd") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "label") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "legend") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "li") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "main") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "map") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "mark") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "math") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "menu") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "meter") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "nav") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "noscript") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "object") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "ol") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "optgroup") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "option") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "output") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "p") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "picture") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "portal") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "progress") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "q") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "rp") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "rt") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "ruby") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "s") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "samp") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "script") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "search") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "section") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "select") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "slot") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "small") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "span") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "strong") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "style") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "sub") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "summary") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "sup") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "svg") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "table") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "tbody") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "td") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "template") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "text") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "tfoot") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "th") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "thead") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "time") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "title") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "tr") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "u") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "ul") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "var") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "video") {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "pre") {
    let children$1 = wrap(
      print_children(children, new PreserveWhitespace()),
      "[",
      "]"
    );
    let _pipe = from_string2("html." + tag$1);
    return append4(
      _pipe,
      wrap(toList([attributes$1, children$1]), "(", ")")
    );
  } else if (tag$1 === "textarea") {
    let content = from_string2(print_string(get_text_content(children)));
    let _pipe = from_string2("html." + tag$1);
    return append4(_pipe, wrap(toList([attributes$1, content]), "(", ")"));
  } else {
    let children$1 = wrap(print_children(children, ws), "[", "]");
    let tag$2 = from_string2(print_string(tag$1));
    let _pipe = from_string2("element");
    return append4(
      _pipe,
      wrap(toList([tag$2, attributes$1, children$1]), "(", ")")
    );
  }
}
function print_children(children, ws) {
  return filter_map(
    children,
    (node) => {
      if (node instanceof Element) {
        let a = node.tag;
        let b = node.attributes;
        let c = node.children;
        return new Ok(print_element(a, b, c, ws));
      } else if (node instanceof Comment) {
        return new Error2(void 0);
      } else if (node instanceof Text2 && isEqual(ws, new StripWhitespace())) {
        let t = node[0];
        let $ = trim_left2(t);
        if ($ === "") {
          return new Error2(void 0);
        } else {
          let t$1 = $;
          return new Ok(print_text(t$1));
        }
      } else {
        let t = node[0];
        return new Ok(print_text(t));
      }
    }
  );
}
function convert(html) {
  let documents = (() => {
    let _pipe2 = html;
    let _pipe$1 = parse_to_records(_pipe2);
    let _pipe$2 = strip_body_wrapper(_pipe$1, html);
    return print_children(_pipe$2, new StripWhitespace());
  })();
  let _pipe = (() => {
    if (documents.hasLength(0)) {
      return empty;
    } else if (documents.hasLength(1)) {
      let document2 = documents.head;
      return document2;
    } else {
      return wrap(documents, "[", "]");
    }
  })();
  return to_string4(_pipe, 80);
}

// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/lustre/lustre/effect.mjs
var Effect = class extends CustomType {
  constructor(all) {
    super();
    this.all = all;
  }
};
function none() {
  return new Effect(toList([]));
}

// build/dev/javascript/lustre/lustre/internals/vdom.mjs
var Text3 = class extends CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
};
var Element2 = class extends CustomType {
  constructor(key, namespace, tag, attrs, children, self_closing, void$) {
    super();
    this.key = key;
    this.namespace = namespace;
    this.tag = tag;
    this.attrs = attrs;
    this.children = children;
    this.self_closing = self_closing;
    this.void = void$;
  }
};
var Attribute = class extends CustomType {
  constructor(x0, x1, as_property) {
    super();
    this[0] = x0;
    this[1] = x1;
    this.as_property = as_property;
  }
};
var Event = class extends CustomType {
  constructor(x0, x1) {
    super();
    this[0] = x0;
    this[1] = x1;
  }
};

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute(name, value2) {
  return new Attribute(name, from(value2), false);
}
function on(name, handler) {
  return new Event("on" + name, handler);
}
function class$(name) {
  return attribute("class", name);
}
function placeholder(text2) {
  return attribute("placeholder", text2);
}
function href(uri) {
  return attribute("href", uri);
}
function rel(relationship) {
  return attribute("rel", relationship);
}

// build/dev/javascript/lustre/lustre/element.mjs
function element(tag, attrs, children) {
  if (tag === "area") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "base") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "br") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "col") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "embed") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "hr") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "img") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "input") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "link") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "meta") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "param") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "source") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "track") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else if (tag === "wbr") {
    return new Element2("", "", tag, attrs, toList([]), false, true);
  } else {
    return new Element2("", "", tag, attrs, children, false, false);
  }
}
function text(content) {
  return new Text3(content);
}

// build/dev/javascript/lustre/lustre/internals/runtime.mjs
var Debug = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Dispatch = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
var Shutdown = class extends CustomType {
};
var ForceModel = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};

// build/dev/javascript/lustre/vdom.ffi.mjs
function morph(prev, next, dispatch, isComponent = false) {
  let out;
  let stack = [{ prev, next, parent: prev.parentNode }];
  while (stack.length) {
    let { prev: prev2, next: next2, parent } = stack.pop();
    if (next2.subtree !== void 0)
      next2 = next2.subtree();
    if (next2.content !== void 0) {
      if (!prev2) {
        const created = document.createTextNode(next2.content);
        parent.appendChild(created);
        out ??= created;
      } else if (prev2.nodeType === Node.TEXT_NODE) {
        if (prev2.textContent !== next2.content)
          prev2.textContent = next2.content;
        out ??= prev2;
      } else {
        const created = document.createTextNode(next2.content);
        parent.replaceChild(created, prev2);
        out ??= created;
      }
    } else if (next2.tag !== void 0) {
      const created = createElementNode({
        prev: prev2,
        next: next2,
        dispatch,
        stack,
        isComponent
      });
      if (!prev2) {
        parent.appendChild(created);
      } else if (prev2 !== created) {
        parent.replaceChild(created, prev2);
      }
      out ??= created;
    } else if (next2.elements !== void 0) {
      iterateElement(next2, (fragmentElement) => {
        stack.unshift({ prev: prev2, next: fragmentElement, parent });
        prev2 = prev2?.nextSibling;
      });
    } else if (next2.subtree !== void 0) {
      stack.push({ prev: prev2, next: next2, parent });
    }
  }
  return out;
}
function createElementNode({ prev, next, dispatch, stack }) {
  const namespace = next.namespace || "http://www.w3.org/1999/xhtml";
  const canMorph = prev && prev.nodeType === Node.ELEMENT_NODE && prev.localName === next.tag && prev.namespaceURI === (next.namespace || "http://www.w3.org/1999/xhtml");
  const el2 = canMorph ? prev : namespace ? document.createElementNS(namespace, next.tag) : document.createElement(next.tag);
  let handlersForEl;
  if (!registeredHandlers.has(el2)) {
    const emptyHandlers = /* @__PURE__ */ new Map();
    registeredHandlers.set(el2, emptyHandlers);
    handlersForEl = emptyHandlers;
  } else {
    handlersForEl = registeredHandlers.get(el2);
  }
  const prevHandlers = canMorph ? new Set(handlersForEl.keys()) : null;
  const prevAttributes = canMorph ? new Set(Array.from(prev.attributes, (a) => a.name)) : null;
  let className = null;
  let style = null;
  let innerHTML = null;
  for (const attr of next.attrs) {
    const name = attr[0];
    const value2 = attr[1];
    if (attr.as_property) {
      if (el2[name] !== value2)
        el2[name] = value2;
      if (canMorph)
        prevAttributes.delete(name);
    } else if (name.startsWith("on")) {
      const eventName = name.slice(2);
      const callback = dispatch(value2);
      if (!handlersForEl.has(eventName)) {
        el2.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      if (canMorph)
        prevHandlers.delete(eventName);
    } else if (name.startsWith("data-lustre-on-")) {
      const eventName = name.slice(15);
      const callback = dispatch(lustreServerEventHandler);
      if (!handlersForEl.has(eventName)) {
        el2.addEventListener(eventName, lustreGenericEventHandler);
      }
      handlersForEl.set(eventName, callback);
      el2.setAttribute(name, value2);
    } else if (name === "class") {
      className = className === null ? value2 : className + " " + value2;
    } else if (name === "style") {
      style = style === null ? value2 : style + value2;
    } else if (name === "dangerous-unescaped-html") {
      innerHTML = value2;
    } else {
      if (typeof value2 === "string")
        el2.setAttribute(name, value2);
      if (name === "value" || name === "selected")
        el2[name] = value2;
      if (canMorph)
        prevAttributes.delete(name);
    }
  }
  if (className !== null) {
    el2.setAttribute("class", className);
    if (canMorph)
      prevAttributes.delete("class");
  }
  if (style !== null) {
    el2.setAttribute("style", style);
    if (canMorph)
      prevAttributes.delete("style");
  }
  if (canMorph) {
    for (const attr of prevAttributes) {
      el2.removeAttribute(attr);
    }
    for (const eventName of prevHandlers) {
      handlersForEl.delete(eventName);
      el2.removeEventListener(eventName, lustreGenericEventHandler);
    }
  }
  if (next.key !== void 0 && next.key !== "") {
    el2.setAttribute("data-lustre-key", next.key);
  } else if (innerHTML !== null) {
    el2.innerHTML = innerHTML;
    return el2;
  }
  let prevChild = el2.firstChild;
  let seenKeys = null;
  let keyedChildren = null;
  let incomingKeyedChildren = null;
  let firstChild = next.children[Symbol.iterator]().next().value;
  if (canMorph && firstChild !== void 0 && // Explicit checks are more verbose but truthy checks force a bunch of comparisons
  // we don't care about: it's never gonna be a number etc.
  firstChild.key !== void 0 && firstChild.key !== "") {
    seenKeys = /* @__PURE__ */ new Set();
    keyedChildren = getKeyedChildren(prev);
    incomingKeyedChildren = getKeyedChildren(next);
  }
  for (const child of next.children) {
    iterateElement(child, (currElement) => {
      if (currElement.key !== void 0 && seenKeys !== null) {
        prevChild = diffKeyedChild(
          prevChild,
          currElement,
          el2,
          stack,
          incomingKeyedChildren,
          keyedChildren,
          seenKeys
        );
      } else {
        stack.unshift({ prev: prevChild, next: currElement, parent: el2 });
        prevChild = prevChild?.nextSibling;
      }
    });
  }
  while (prevChild) {
    const next2 = prevChild.nextSibling;
    el2.removeChild(prevChild);
    prevChild = next2;
  }
  return el2;
}
var registeredHandlers = /* @__PURE__ */ new WeakMap();
function lustreGenericEventHandler(event2) {
  const target = event2.currentTarget;
  if (!registeredHandlers.has(target)) {
    target.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  const handlersForEventTarget = registeredHandlers.get(target);
  if (!handlersForEventTarget.has(event2.type)) {
    target.removeEventListener(event2.type, lustreGenericEventHandler);
    return;
  }
  handlersForEventTarget.get(event2.type)(event2);
}
function lustreServerEventHandler(event2) {
  const el2 = event2.target;
  const tag = el2.getAttribute(`data-lustre-on-${event2.type}`);
  const data = JSON.parse(el2.getAttribute("data-lustre-data") || "{}");
  const include = JSON.parse(el2.getAttribute("data-lustre-include") || "[]");
  switch (event2.type) {
    case "input":
    case "change":
      include.push("target.value");
      break;
  }
  return {
    tag,
    data: include.reduce(
      (data2, property) => {
        const path = property.split(".");
        for (let i = 0, o = data2, e = event2; i < path.length; i++) {
          if (i === path.length - 1) {
            o[path[i]] = e[path[i]];
          } else {
            o[path[i]] ??= {};
            e = e[path[i]];
            o = o[path[i]];
          }
        }
        return data2;
      },
      { data }
    )
  };
}
function getKeyedChildren(el2) {
  const keyedChildren = /* @__PURE__ */ new Map();
  if (el2) {
    for (const child of el2.children) {
      iterateElement(child, (currElement) => {
        const key = currElement?.key || currElement?.getAttribute?.("data-lustre-key");
        if (key)
          keyedChildren.set(key, currElement);
      });
    }
  }
  return keyedChildren;
}
function diffKeyedChild(prevChild, child, el2, stack, incomingKeyedChildren, keyedChildren, seenKeys) {
  while (prevChild && !incomingKeyedChildren.has(prevChild.getAttribute("data-lustre-key"))) {
    const nextChild = prevChild.nextSibling;
    el2.removeChild(prevChild);
    prevChild = nextChild;
  }
  if (keyedChildren.size === 0) {
    iterateElement(child, (currChild) => {
      stack.unshift({ prev: prevChild, next: currChild, parent: el2 });
      prevChild = prevChild?.nextSibling;
    });
    return prevChild;
  }
  if (seenKeys.has(child.key)) {
    console.warn(`Duplicate key found in Lustre vnode: ${child.key}`);
    stack.unshift({ prev: null, next: child, parent: el2 });
    return prevChild;
  }
  seenKeys.add(child.key);
  const keyedChild = keyedChildren.get(child.key);
  if (!keyedChild && !prevChild) {
    stack.unshift({ prev: null, next: child, parent: el2 });
    return prevChild;
  }
  if (!keyedChild && prevChild !== null) {
    const placeholder2 = document.createTextNode("");
    el2.insertBefore(placeholder2, prevChild);
    stack.unshift({ prev: placeholder2, next: child, parent: el2 });
    return prevChild;
  }
  if (!keyedChild || keyedChild === prevChild) {
    stack.unshift({ prev: prevChild, next: child, parent: el2 });
    prevChild = prevChild?.nextSibling;
    return prevChild;
  }
  el2.insertBefore(keyedChild, prevChild);
  stack.unshift({ prev: keyedChild, next: child, parent: el2 });
  return prevChild;
}
function iterateElement(element2, processElement) {
  if (element2.elements !== void 0) {
    for (const currElement of element2.elements) {
      processElement(currElement);
    }
  } else {
    processElement(element2);
  }
}

// build/dev/javascript/lustre/client-runtime.ffi.mjs
var LustreClientApplication2 = class _LustreClientApplication {
  #root = null;
  #queue = [];
  #effects = [];
  #didUpdate = false;
  #isComponent = false;
  #model = null;
  #update = null;
  #view = null;
  static start(flags, selector, init3, update3, view2) {
    if (!is_browser())
      return new Error2(new NotABrowser());
    const root2 = selector instanceof HTMLElement ? selector : document.querySelector(selector);
    if (!root2)
      return new Error2(new ElementNotFound(selector));
    const app = new _LustreClientApplication(init3(flags), update3, view2, root2);
    return new Ok((msg) => app.send(msg));
  }
  constructor([model, effects], update3, view2, root2 = document.body, isComponent = false) {
    this.#model = model;
    this.#update = update3;
    this.#view = view2;
    this.#root = root2;
    this.#effects = effects.all.toArray();
    this.#didUpdate = true;
    this.#isComponent = isComponent;
    window.requestAnimationFrame(() => this.#tick());
  }
  send(action) {
    switch (true) {
      case action instanceof Dispatch: {
        this.#queue.push(action[0]);
        this.#tick();
        return;
      }
      case action instanceof Shutdown: {
        this.#shutdown();
        return;
      }
      case action instanceof Debug: {
        this.#debug(action[0]);
        return;
      }
      default:
        return;
    }
  }
  emit(event2, data) {
    this.#root.dispatchEvent(
      new CustomEvent(event2, {
        bubbles: true,
        detail: data,
        composed: true
      })
    );
  }
  #tick() {
    this.#flush_queue();
    const vdom = this.#view(this.#model);
    const dispatch = (handler) => (e) => {
      const result = handler(e);
      if (result instanceof Ok) {
        this.send(new Dispatch(result[0]));
      }
    };
    this.#didUpdate = false;
    this.#root = morph(this.#root, vdom, dispatch, this.#isComponent);
  }
  #flush_queue(iterations = 0) {
    while (this.#queue.length) {
      const [next, effects] = this.#update(this.#model, this.#queue.shift());
      this.#didUpdate ||= !isEqual(this.#model, next);
      this.#model = next;
      this.#effects = this.#effects.concat(effects.all.toArray());
    }
    while (this.#effects.length) {
      this.#effects.shift()(
        (msg) => this.send(new Dispatch(msg)),
        (event2, data) => this.emit(event2, data)
      );
    }
    if (this.#queue.length) {
      if (iterations < 5) {
        this.#flush_queue(++iterations);
      } else {
        window.requestAnimationFrame(() => this.#tick());
      }
    }
  }
  #debug(action) {
    switch (true) {
      case action instanceof ForceModel: {
        const vdom = this.#view(action[0]);
        const dispatch = (handler) => (e) => {
          const result = handler(e);
          if (result instanceof Ok) {
            this.send(new Dispatch(result[0]));
          }
        };
        this.#queue = [];
        this.#effects = [];
        this.#didUpdate = false;
        this.#root = morph(this.#root, vdom, dispatch, this.#isComponent);
      }
    }
  }
  #shutdown() {
    this.#root.remove();
    this.#root = null;
    this.#model = null;
    this.#queue = [];
    this.#effects = [];
    this.#didUpdate = false;
    this.#update = () => {
    };
    this.#view = () => {
    };
  }
};
var start = (app, selector, flags) => LustreClientApplication2.start(
  flags,
  selector,
  app.init,
  app.update,
  app.view
);
var is_browser = () => window && window.document;

// build/dev/javascript/lustre/lustre.mjs
var App = class extends CustomType {
  constructor(init3, update3, view2, on_attribute_change) {
    super();
    this.init = init3;
    this.update = update3;
    this.view = view2;
    this.on_attribute_change = on_attribute_change;
  }
};
var ElementNotFound = class extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
};
var NotABrowser = class extends CustomType {
};
function application(init3, update3, view2) {
  return new App(init3, update3, view2, new None());
}
function simple(init3, update3, view2) {
  let init$1 = (flags) => {
    return [init3(flags), none()];
  };
  let update$1 = (model, msg) => {
    return [update3(model, msg), none()];
  };
  return application(init$1, update$1, view2);
}
function start3(app, selector, flags) {
  return guard(
    !is_browser(),
    new Error2(new NotABrowser()),
    () => {
      return start(app, selector, flags);
    }
  );
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function link(attrs) {
  return element("link", attrs, toList([]));
}
function section(attrs, children) {
  return element("section", attrs, children);
}
function div(attrs, children) {
  return element("div", attrs, children);
}
function textarea(attrs, content) {
  return element("textarea", attrs, toList([text(content)]));
}

// build/dev/javascript/lustre/lustre/event.mjs
function on2(name, handler) {
  return on(name, handler);
}
function value(event2) {
  let _pipe = event2;
  return field("target", field("value", string))(
    _pipe
  );
}
function on_input(msg) {
  return on2(
    "input",
    (event2) => {
      let _pipe = value(event2);
      return map2(_pipe, msg);
    }
  );
}

// build/dev/javascript/app/app.mjs
var Model = class extends CustomType {
  constructor(rendered_lustre) {
    super();
    this.rendered_lustre = rendered_lustre;
  }
};
var UserUpdatedHtml = class extends CustomType {
  constructor(x0) {
    super();
    this[0] = x0;
  }
};
function init2(_) {
  return new Model("");
}
function update2(_, msg) {
  let html = msg[0];
  let html$1 = convert(html);
  return new Model(html$1);
}
function layout(children) {
  return div(
    toList([]),
    prepend(
      link(
        toList([
          rel("stylesheet"),
          href("priv/static/app.css")
        ])
      ),
      children
    )
  );
}
function view(model) {
  return layout(
    toList([
      div(
        toList([class$("grid grid-cols-2 font-mono h-screen")]),
        toList([
          section(
            toList([
              class$(
                "block w-full h-full border-2 border-r-1 border-[#ffaff3]"
              )
            ]),
            toList([
              textarea(
                toList([
                  class$("bg-transparent p-4 block w-full h-full"),
                  placeholder(
                    "Hello! Paste your HTML here and I'll convert it to Lustre"
                  ),
                  on_input(
                    (var0) => {
                      return new UserUpdatedHtml(var0);
                    }
                  )
                ]),
                ""
              )
            ])
          ),
          section(
            toList([
              class$(
                "bg-[#282c34] border-2 border-l-1 border-[#ffaff3]"
              )
            ]),
            toList([
              textarea(
                toList([
                  class$(
                    "bg-transparent text-gray-300 p-4 block w-full h-full"
                  )
                ]),
                model.rendered_lustre
              )
            ])
          )
        ])
      )
    ])
  );
}
function main() {
  let app = simple(init2, update2, view);
  let $ = start3(app, "#app", void 0);
  if (!$.isOk()) {
    throw makeError(
      "assignment_no_match",
      "app",
      10,
      "main",
      "Assignment pattern did not match",
      { value: $ }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main();
