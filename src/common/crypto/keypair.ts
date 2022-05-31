import { DEBUG_ALL_LOADED } from "../debug";
import { endings, loadFile, mime, writeFile } from "../filesystem";
import { ILoaded } from "../utils";
import bs58 from "bs58";
import { List as ListFile } from "./listfile";
import { decryptJsonObject, encryptJsonObject } from ".";
import { get, set } from "idb-keyval";
export const AES_IV_BYTES = 32;
export const AES_KEY_BITS = AES_IV_BYTES * 8;
export const VERSION = 1;

export interface IKeyPairSerialized {
  key: string;
  iv: string;
  version: number;
}

export interface KeyPair {
  key: CryptoKey;
  iv: Uint8Array;
}

export type KeyPairStore = KeypairFile & ILoaded;

export interface KeypairFile extends KeyPair {
  version: number;
}


export const defaultKeyPairStore = () =>
  ({
    loaded: DEBUG_ALL_LOADED,
    version: VERSION,
  } as KeyPairStore);

export function encryptList(pair: KeyPair, s: ListFile) {
  const a: ListFile = {
    ideas: s.ideas,
    name: s.name,
  };

  return encryptJsonObject(pair, a);
}

export async function decryptList(
  pair: KeyPair,
  f: ArrayBuffer
): Promise<ListFile> {
  const a = await decryptJsonObject<ListFile>(pair, f);

  const b: ListFile = {
    ideas: a.ideas,
    name: a.name,
  };

  return b;
}

export const createNewKeypair = async () => {
  const CRYPTO_KEY = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: AES_KEY_BITS,
      hash: "SHA-512",
      salt: crypto.getRandomValues(new Uint8Array(AES_IV_BYTES)),
      iterations: 10000000,
    },
    true,
    ["encrypt", "decrypt"]
  );

  const a: KeypairFile = {
    key: CRYPTO_KEY,
    version: VERSION,
    iv: crypto.getRandomValues(new Uint8Array(AES_IV_BYTES)),
  };

  return a;
};

async function resolveKeyPair(): Promise<[ArrayBuffer, boolean]> {
  const idb_keypair: FileSystemFileHandle = await get("keypair");

  if (idb_keypair == null) {
    const [jsonBuffer, handle] = await loadFile(
      mime.json,
      endings.json,
      "keypair"
    );
    await set("keypair", handle);
    return [jsonBuffer, true];
  }

  const IDB_KEYPAIR_PERM = await idb_keypair.queryPermission({ mode: "read" })
  console.log(IDB_KEYPAIR_PERM)

  if (IDB_KEYPAIR_PERM == "prompt") {
    console.log(`Requesting keypair permission.`)
    await idb_keypair.requestPermission({ mode: "read" });
    set("keypair", idb_keypair)
  }

  // * If does not have permission exception will be thrown. *
  const f = await idb_keypair.getFile();
  const bin = await f.arrayBuffer();
  return [bin, true];
}

export async function loadKeyPair() {
  const [keypairBuffer, success] = await resolveKeyPair();

  const s_Keypair = JSON.parse(new TextDecoder().decode(keypairBuffer));

  const key = await crypto.subtle.importKey(
    "raw",
    bs58.decode(s_Keypair.key),
    {
      name: "AES-GCM",
      hash: "SHA-512",
      length: AES_KEY_BITS,
    },
    true,
    ["encrypt", "decrypt"]
  );
  const PAIR: KeypairFile = {
    key,
    iv: bs58.decode(s_Keypair.iv),
    version: s_Keypair.version,
  };

  return PAIR;
}

export async function serializeKeyPair(keypair: KeypairFile) {
  const KEY_BUF = new Uint8Array(
    await crypto.subtle.exportKey("raw", keypair.key)
  );

  const SERIALIZED_KEYPAIR: IKeyPairSerialized = {
    key: bs58.encode(KEY_BUF),
    iv: bs58.encode(keypair.iv),
    version: keypair.version,
  };

  return SERIALIZED_KEYPAIR;
}

export async function exportKeyPair(keypair: KeypairFile) {
  const s = await serializeKeyPair(keypair);
  await writeFile(
    JSON.stringify(s, null, 2),
    mime.json,
    endings.json,
    getKeypairName(),
    "keypair"
  );
}

export function getKeypairName() {
  const a = crypto.getRandomValues(new Uint8Array(4));

  const id = bs58.encode(a);
  const date = new Date();
  const name = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-Keypair-${id}.json`;
  return name;
}
