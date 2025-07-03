/** @jsxImportSource @emotion/react */
import { useRef, useState, useEffect } from 'react';
import styled from '@emotion/styled';


const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Pretendard', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%);
  box-sizing: border-box;
  overflow: auto;
`;

const Container = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(60,80,120,0.12), 0 1.5px 4px rgba(60,80,120,0.08);
  max-width: 540px;
  width: 100%;
  min-height: 520px;
  padding: 48px 36px 36px 36px;
  text-align: center;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: box-shadow 0.2s;
`;

const Title = styled.h1`
  margin-bottom: 32px;
  font-size: 2.2rem;
  font-weight: 800;
  color: #2d3a4a;
  letter-spacing: -1px;
  text-shadow: 0 2px 8px rgba(180,200,255,0.08);
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 28px 20px;
  align-items: center;
  margin-bottom: 32px;
`;

const FileButton = styled.label`
  position: relative;
  overflow: hidden;
  display: inline-block;
  button {
    border: none;
    background: linear-gradient(90deg, #4a90e2 0%, #357ab8 100%);
    color: #fff;
    padding: 12px 32px;
    font-size: 1.05rem;
    font-weight: 700;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(74,144,226,0.10);
    letter-spacing: 0.5px;
  }
  button:hover {
    background: linear-gradient(90deg, #357ab8 0%, #4a90e2 100%);
    box-shadow: 0 4px 16px rgba(74,144,226,0.18);
  }
  input {
    position: absolute;
    left: 0; top: 0;
    width: 100%; height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 10px 18px;
  box-shadow: 0 1px 4px rgba(60,80,120,0.06);
`;

const RangeInput = styled.input`
  -webkit-appearance: none;
  width: 220px;
  height: 8px;
  background: linear-gradient(90deg, #e0eafc 0%, #c3cfe2 100%);
  border-radius: 4px;
  outline: none;
  transition: background 0.3s;
  margin: 0 8px;
  &:hover {
    background: linear-gradient(90deg, #c3cfe2 0%, #e0eafc 100%);
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #4a90e2 0%, #357ab8 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(74,144,226,0.18);
    border: 3px solid #fff;
    transition: background 0.2s;
    }
  &::-webkit-slider-thumb:hover {
    background: linear-gradient(135deg, #357ab8 0%, #4a90e2 100%);
  }
  &::-moz-range-thumb {
    width: 26px;
    height: 26px;
    background: linear-gradient(135deg, #4a90e2 0%, #357ab8 100%);
    border: 3px solid #fff;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(74,144,226,0.18);
    transition: background 0.2s;
  }
`;

const Label = styled.span`
  font-weight: 700;
  color: #357ab8;
  min-width: 90px;
  text-align: center;
  font-size: 1.08rem;
  letter-spacing: 0.2px;
`;

const CanvasContainer = styled.div`
    width: 100%;
  min-height: 370px;
  padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-sizing: border-box;
  background: #f5f7fa;
  border-radius: 16px;
  box-shadow: 0 1.5px 8px rgba(60,80,120,0.07);
  margin-top: 12px;
`;

const CanvasStyled = styled.canvas`
  display: block;
  max-width: 100%;
  height: 340px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(60,80,120,0.10);
  background: #fff;
`;

const steps = [2,4,8,16,32,64,128,256];

export default function Pixelation() {
    const fileRef = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const originCanvasRef = useRef(document.createElement('canvas'));

    const [exp, setExp] = useState(7);
    const [labelText, setLabelText] = useState('256×256');
    // fullData는 이미지의 픽셀 데이터를 저장하는 배열
    // 각 픽셀은 RGBA 값으로 표현되며, 4개의 값이 연속적으로 저장됨
    // 예: [R1, G1, B1, A1,      R2, G2, B2, A2,    ...] Uint8ClampedArray(4194304)
    // 예: [192, 149, 68, 255,   232, 190, 112, 255 ...]
    // fullData의 길이는 이미지의 가로 픽셀 수 * 세로 픽셀 수 * 4
    // 예: 1024 * 1024 * 4채널(R,G,B,A) = 4194304
    const [fullData, setFullData] = useState(null);
    const [imgSize, setImgSize] = useState({w:0, h:0});
    const [saveImgSize, setSaveImgSize] = useState({w:0, h:0});

    const handleFileChange = (e:  React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            const imgW = img.width, imgH = img.height;
            const canvas = canvasRef.current;

            if (!canvas) return;
            canvas.width = imgW; canvas.height = imgH;
            const originCanvas = originCanvasRef.current;
            originCanvas.width = imgW; originCanvas.height = imgH;
            const offCtx = originCanvas.getContext('2d');
            offCtx?.drawImage(img,0,0);
            const data = offCtx?.getImageData(0,0,imgW,imgH).data;

            setImgSize({w: imgW, h: imgH});
            setSaveImgSize({w: imgW, h: imgH});
            setFullData(data);
            setExp(steps.length);
        };

        img.src = URL.createObjectURL(file);
    };
    useEffect(() => {
        console.log(fullData)
        if (!fullData) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const offCanvas = originCanvasRef.current;
        const { w: imgW, h: imgH } = imgSize;

        ctx.clearRect(0,0,imgW,imgH);

        if (exp === steps.length) {
            setLabelText('원본');
            ctx.drawImage(offCanvas, 0, 0);
            return;
        }
        const blocks = steps[exp];
        setLabelText(`${blocks}×${blocks}`);
        const stepX = Math.ceil(imgW / blocks);
        const stepY = Math.ceil(imgH / blocks);

        for (let by=0; by<imgH; by+=stepY) {
            for (let bx=0; bx<imgW; bx+=stepX) {
                const w = Math.min(stepX, imgW-bx);
                const h = Math.min(stepY, imgH-by);
                let counts = Object.create(null), maxKey=0, maxCount=0;
                for (let y=0; y<h; y++) {
                    let offset = ((by+y)*imgW + bx)*4;
                    for (let x=0; x<w; x++, offset+=4) {
                        const key = (fullData[offset]<<16) | (fullData[offset+1]<<8) | fullData[offset+2];
                        const cnt = (counts[key] = (counts[key]||0)+1);
                        if (cnt>maxCount) { maxCount=cnt; maxKey=key; }
                    }
                }
                const r = (maxKey>>16)&0xFF;
                const g = (maxKey>>8)&0xFF;
                const b = maxKey&0xFF;
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(bx,by,w,h);
            }
        }
    }, [exp, fullData, imgSize]);

    return (
        <Wrapper>
            <Container>
                <Title>Pixelize</Title>
                <Controls>
                    <SliderContainer>
                        <label htmlFor="exp">단계:</label>
                        <RangeInput
                            id="exp"
                            type="range"
                            min={0}
                            max={steps.length}
                            value={exp}
                            onChange={e => setExp(+e.target.value)}
                        />
                        <Label>{labelText}</Label>
                    </SliderContainer>
                    <FileButton>
                        <button>이미지 선택</button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
                    </FileButton>
                </Controls>
                <CanvasContainer>
                    <CanvasStyled ref={canvasRef}/>
                </CanvasContainer>
            </Container>
                {fullData && (
                    <div style={{ position: 'absolute', top: 32, right: 32, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, minWidth: 220, minHeight: 80 }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4, minWidth: 200 }}>
                          <input
                                type="number"
                                min={saveImgSize.w}
                                max={2048}
                                value={saveImgSize.w}
                                style={{ width: 80, marginRight: 6, borderRadius: 6, border: '1px solid #bcd', padding: '4px 8px', minWidth: 60 }}
                                onChange={e => {
                                    // 저장용 사이즈만 별도 상태로 관리
                                    const newW = Math.max(1, Math.min(1024, Number(e.target.value)));
                                    const ratio = saveImgSize.h / saveImgSize.w;
                                    setSaveImgSize({ w: newW, h: Math.round(newW * ratio) });
                                }}
                            />
                            <span style={{ fontWeight: 700, color: '#357ab8', marginRight: 6 }}>px ×</span>
                            <input
                                type="number"
                                min={saveImgSize.h}
                                max={2048}
                                value={saveImgSize.h}
                                style={{ width: 80, borderRadius: 6, border: '1px solid #bcd', padding: '4px 8px', minWidth: 60 }}
                                readOnly
                                tabIndex={-1}
                            />
                            <span style={{ fontWeight: 700, color: '#357ab8', marginLeft: 6 }}>px</span>
                        </div>
                        <button
                            style={{
                                background: 'linear-gradient(90deg, #4a90e2 0%, #357ab8 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 10,
                                padding: '10px 28px',
                                cursor: 'pointer',
                                fontWeight: 800,
                                fontSize: 16,
                                boxShadow: '0 2px 12px rgba(74,144,226,0.13)',
                                letterSpacing: '0.5px',
                                transition: 'background 0.2s, box-shadow 0.2s',
                                minWidth: 160,
                                minHeight: 40
                            }}
                            onMouseOver={e => {
                                (e.currentTarget as HTMLButtonElement).style.background =
                                    'linear-gradient(90deg, #357ab8 0%, #4a90e2 100%)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                    '0 4px 18px rgba(74,144,226,0.18)';
                            }}
                            onMouseOut={e => {
                                (e.currentTarget as HTMLButtonElement).style.background =
                                    'linear-gradient(90deg, #4a90e2 0%, #357ab8 100%)';
                                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                                    '0 2px 12px rgba(74,144,226,0.13)';
                            }}
                            onClick={() => {
                                const canvas = canvasRef.current;
                                if (!canvas) return;
                                // 새로운 캔버스에 리사이즈 후 다운로드
                                const tempCanvas = document.createElement('canvas');
                                console.log(tempCanvas)
                                tempCanvas.width = saveImgSize.w;
                                tempCanvas.height = saveImgSize.h;
                                const tempCtx = tempCanvas.getContext('2d');
                                console.log(tempCtx)
                                if (!tempCtx) return;
                                tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, saveImgSize.w, saveImgSize.h);
                                const link = document.createElement('a');
                                link.download = 'pixelated.png';
                                link.href = tempCanvas.toDataURL('image/png');
                                link.click();
                            }}
                        >
                            이미지 다운로드
                        </button>
                    </div>
                )}
        </Wrapper>
    );
}
