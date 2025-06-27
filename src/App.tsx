
import {css} from "@emotion/react";
import Pixelation from "./Pixelation.tsx";

function App() {
    return (
        <div css={css`
        width: 100vw;
        height: 100dvh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}>
            <Pixelation />
        </div>
    )
}

export default App
