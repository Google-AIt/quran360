import fastabiqu from "@/assets/bags/fastabiqu-alkhayrat.jpg.asset.json";
import wajadilhum from "@/assets/bags/wajadilhum-billati-hiya-ahsan.jpg.asset.json";
import qadAflaha from "@/assets/bags/qad-aflaha-man-tazakka.jpg.asset.json";
import qawama from "@/assets/bags/wakana-bayna-thalika-qawama.jpg.asset.json";
import ruhamaa from "@/assets/bags/ruhamaa-baynahum.jpg.asset.json";
import walAsr from "@/assets/bags/wal-asr.jpg.asset.json";
import hattaYughayyiru from "@/assets/bags/hatta-yughayyiru-ma-bianfusihim.jpg.asset.json";
import walkazimeen from "@/assets/bags/walkazimeen-alghayz.jpg.asset.json";
import faidha from "@/assets/bags/faidha-faraghta-fansab.jpg.asset.json";
import wahadayn from "@/assets/bags/wahadayn-alnajdayn.jpg.asset.json";
import kullNafs from "@/assets/bags/kull-nafs-bima-kasabat-raheena.jpg.asset.json";
import thummaAtba from "@/assets/bags/thumma-atba-sababan.jpg.asset.json";

export const bagImages: Record<string, string> = {
  "fastabiqu-alkhayrat": fastabiqu.url,
  "wajadilhum-billati-hiya-ahsan": wajadilhum.url,
  "qad-aflaha-man-tazakka": qadAflaha.url,
  "wakana-bayna-thalika-qawama": qawama.url,
  "ruhamaa-baynahum": ruhamaa.url,
  "wal-asr": walAsr.url,
  "hatta-yughayyiru-ma-bianfusihim": hattaYughayyiru.url,
  "walkazimeen-alghayz": walkazimeen.url,
  "faidha-faraghta-fansab": faidha.url,
  "wahadayn-alnajdayn": wahadayn.url,
  "kull-nafs-bima-kasabat-raheena": kullNafs.url,
  "thumma-atba-sababan": thummaAtba.url,
};

export function bagImage(slug: string): string | undefined {
  return bagImages[slug];
}
