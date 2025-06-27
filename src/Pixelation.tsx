/** @jsxImportSource @emotion/react */
import { useRef, useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {css} from "@emotion/react";


const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
  box-sizing: border-box;
`;

const Container = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  max-width: 700px;
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  font-size: 28px;
  color: #333;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
 
  align-items: center;
`;

const FileButton = styled.label`
  position: relative;
  overflow: hidden;
  display: inline-block;
  button {
    border: none;
    background: #4a90e2;
    color: #fff;
    padding: 10px 22px;
    font-size: 15px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s;
  }
  button:hover {
    background: #357ab8;
  }
  input {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RangeInput = styled.input`
  -webkit-appearance: none;
  width: 250px;
  height: 6px;
  background: #ddd;
  border-radius: 3px;
  outline: none;
  transition: background 0.3s;
  &:hover {
    background: #ccc;
  }
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: #4a90e2;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: background 0.3s;
    &:hover {
      background: #357ab8;
    }
  }
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #4a90e2;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transition: background 0.3s;
  }
`;

const Label = styled.span`
  font-weight: bold;
  color: #333;
  min-width: 80px;
  text-align: center;
`;

const CanvasContainer = styled.div`
    width: 100%;
    height: 100%;
    padding:20px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    box-sizing: border-box;
`;

const CanvasStyled = styled.canvas`
  display: block;
  height: 350px;  
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const steps = [2,4,8,16,32,64,128,256];

export default function Pixelation() {
    const fileRef = useRef(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const offCanvasRef = useRef(document.createElement('canvas'));
    const [exp, setExp] = useState(7);
    const [labelText, setLabelText] = useState('256×256');
    const [fullData, setFullData] = useState(null);
    const [imgSize, setImgSize] = useState({w:0, h:0});

    useEffect(() => {
        if (!fullData) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const offCanvas = offCanvasRef.current;
        const { w: imgW, h: imgH } = imgSize;

        ctx.clearRect(0,0,imgW,imgH);
        // exp index 0~7 = 2,4...256, index 8 = 원본
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

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const img = new Image();
        img.onload = () => {
            const imgW = img.width, imgH = img.height;
            const canvas = canvasRef.current;
            canvas.width = imgW; canvas.height = imgH;
            const offCanvas = offCanvasRef.current;
            offCanvas.width = imgW; offCanvas.height = imgH;
            const offCtx = offCanvas.getContext('2d');
            offCtx?.drawImage(img,0,0);
            const data = offCtx?.getImageData(0,0,imgW,imgH).data;
            setImgSize({w: imgW, h: imgH});
            setFullData(data);
            setExp(steps.length);
        };
        img.src = URL.createObjectURL(file);
    };

    return (
        <Wrapper>
            <Container>
                <Title>픽셀화 모드</Title>
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
        </Wrapper>
    );
}
