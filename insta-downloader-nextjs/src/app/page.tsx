'use client';
// import { scrap } from '@/service/scraping';
import Image from 'next/image';
import { useState } from 'react';
import styles from './page.module.css';

// const imgSrcs = scrap('https://www.instagram.com/p/CyA-20PrdS1/?img_index=1');
// scrap('https://www.instagram.com/p/CyQ7_2RLUp4/?utm_source=ig_web_copy_link&igshid=MzRlODBiNWFlZA%3D%3D')
// async function getImages() {
//   const imgSrcs = await scrap(
//     'https://www.instagram.com/p/CyA-20PrdS1/?img_index=1'
//   );
//   return imgSrcs;
// }

// function getBlobUrls(urls: string[]): string[] {
//   const blobUrls: string[] = [];

//   urls.forEach(async (url: string) => {
//     console.log('url', url);
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const blob = await response.blob();

//     // Blob URL을 생성합니다.
//     const blobUrl = window.URL.createObjectURL(blob);
//     blobUrls.push(blobUrl);

//   });
//   return blobUrls;

// }

export default function Home() {
  // const imgSrcs = await getImages();
  const [imgSrcs, setImgSrcs] = useState<string[]>([]);
  const [url, setUrl] = useState<string>('');
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Instagram Image Scraper</h1>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URL을 입력하세요."
      />
      <button
        onClick={async () => {
          const imgSrcs = await fetch(`/api/scrap?` + new URLSearchParams({ url: url }), { cache: 'force-cache' });
          setImgSrcs(await imgSrcs.json());
        }}
      >
        스크랩
      </button>
      {/* <button
        onClick={async () => {
          // const blogUrls = getBlobUrls(imgSrcs);
          imgSrcs.forEach((url: string, index: number) => {
            const link = document.createElement('a');
            link.href = url;
            link.download = `image-${index}.png`; // 다운로드하는 파일의 이름을 설정합니다.
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          );
        }}
      >전체 다운로드</button> */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center' }}>
        {imgSrcs.map((src: string, i: number) => (
          <div key={i} style={{ width: '300px', margin: '10px', position: 'relative' }}>
            <Image
              src={src}
              alt="Picture of the author"
              layout="responsive"
              width={300} // 이 값은 실제 이미지의 비율에 따라 조정할 수 있습니다.
              height={300} // 이 값은 실제 이미지의 비율에 따라 조정할 수 있습니다.
              objectFit="contain" // 이미지가 컨테이너 안에 꽉 차도록 조정하되, 비율을 유지합니다.

            />
            <div style={{ position: 'absolute', right: 4, bottom: 10 }}>
              <button
                style={{ float: 'right', fontSize: '16px' }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = src;
                  link.download = `image-${i}.png`; // 다운로드하는 파일의 이름을 설정합니다.
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                DOWN
              </button>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}
