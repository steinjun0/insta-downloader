'use client';

import { Box, Button, Card, CardActions, CardContent, CircularProgress, Container, Grid, TextField, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [imgSrcs, setImgSrcs] = useState<string[]>([]);
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onScrap = async () => {
    setImgSrcs([]);
    setIsLoading(true);
    const imgSrcs = await fetch(`/api/scrap?` + new URLSearchParams({ url: url }), { cache: 'force-cache' });
    setImgSrcs(await imgSrcs.json());
    setIsLoading(false);
  };

  return (
    <main>
      <Container sx={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '32px', paddingBottom: '32px' }}>
        <Box>
          <Image
            src="/logo-100.png"
            alt="ig image downloader"
            width={50}
            height={50}
            objectFit="contain"
          />
          <h1>Instagram Image Downloader</h1>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <TextField
            fullWidth
            label="URL"
            variant="outlined"
            value={url}
            autoComplete='off'
            onKeyDown={(e) => {
              // enter 입력시 스크랩
              if (e.key === 'Enter') {
                onScrap();
              }
            }}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL을 입력하세요."
            disabled={isLoading}
          />
          <Button
            variant="contained"
            color="primary"
            sx={{ width: '100px', height: '56px' }}
            onClick={async () => {
              onScrap();
            }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : '스크랩'}
          </Button>
        </Box>


        <Grid container spacing={2} style={{ marginTop: '20px' }}>
          {imgSrcs.length === 0 ? ( // imgSrcs 배열의 길이를 확인합니다.
            !isLoading && ( // 로딩 중이 아니라면 메시지를 표시합니다.
              <Typography variant="h6" style={{ margin: '0 auto' }}>
                출력할 사진이 없습니다.
              </Typography>
            )
          ) : (
            imgSrcs.map((src: string, i: number) => (
              <Grid item key={i} xs={12} sm={6} md={4}>
                <Card
                  variant='outlined'
                >
                  <CardContent>
                    <Image
                      src={src}
                      alt="Scraped from Instagram"
                      layout="responsive"
                      width={300}
                      height={300}
                      objectFit="contain"
                    />
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = src;
                        const extensionsMap: { [key: string]: string; } = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/gif': '.gif', 'image/webp': '.webp' };
                        const extension = extensionsMap[src.match(/data:([^;]+);/)![1]] || null;
                        link.download = `${Date.now()}.${extension}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

    </main>
  );
}
