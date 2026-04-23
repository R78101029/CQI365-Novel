# Google Veo 3 《惘然》預告片專屬生成指令 (Long-take Concept Trailer Prompt)

> **使用說明**：Google Veo 3 的強項在於「長時間的穩定性」與「複雜的連續運鏡」。這個提示詞設計採用了**「一鏡到底 (One-Take)」**的手法，讓畫面具備空間的推移與情緒的轉換，充分發揮 Veo 生成 60 秒電影級長鏡頭的威力。

## 📍 核心 Prompt (直接複製這段英文給 Veo 3)

```text
Generate a continuous 8-second cinematic shot. 

The shot begins with an extreme macro close-up of a vintage pocket watch, its hands frozen exactly at 3:07. The camera's focus is locked tightly on the metallic gears and the dust particles floating in the warm tungsten light. In the out-of-focus background sits a breathtakingly handsome Asian man around 30 years old (facial features resembling actor Takeshi Kaneshiro), wearing a dark grey high-neck sweater. 

At the 3-second mark, perform a smooth and dramatic rack-focus (pull focus). The pocket watch dissolves into a soft blur, and the man's face comes into razor-sharp focus. He is slowly lowering his hand from holding a vintage telephone receiver. His deep, melancholic eyes go wide with silent devastation, and a single tear escapes his eye, rolling slowly down his cheek. 

The camera executes a very subtle, agonizingly slow push-in toward his face as the tear falls. High-end Hollywood cinematic lighting, shot on 35mm lens, 1080p or 8k resolution, photorealistic, incredibly detailed, cold blue and grey cinematic environment with warm tungsten lighting contrast. Emotionally devastating atmosphere. Do NOT make it look like 3D animation, it must look like a masterpiece live-action film.
```

---

## 💡 針對 8 秒限制的最佳化策略：

既然長度只有 8 秒，我們**絕對不能把原本 60 秒的動作全部塞進去**，否則畫面會變成超速快轉（Hyper-lapse），完全破壞微短劇的憂鬱感。

在這 8 秒內，我們專注讓 Veo 發揮兩項它最強的「電影級光學物理技術」：
1. **精密的焦點轉換 (Rack Focus)**：從前景的懷錶，平滑過渡對焦到後景的男主臉孔。這在傳統攝影中極具張力，而且考驗 AI 對景深 (Depth of field) 的還原度，Veo 處理這種光學變化非常真實。
2. **極致的微表情與流體物理 (Tear falling)**：只專注在「得知死訊的那一秒」這一個動作上，讓 8 秒的算力全開去處理那一滴眼淚的流光反光與男主角面部錯愕的微表情。
