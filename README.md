# 🏥 의료 규제 전문가 에이전트

[Deepagents](https://github.com/langchain-ai/deepagents)를 기반으로 한 **의료 규제 전문가 에이전트** 프론트엔드 애플리케이션입니다. LangGraph SDK를 사용하여 LangChain/LangGraph 에이전트와 상호작용하는 웹 인터페이스를 제공합니다.

> 📖 **상세 문서**: [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)를 참조하세요.

## 🚀 Quickstart

**Install dependencies and run the app**

```bash
$ git clone https://github.com/langchain-ai/deep-agents-ui.git
$ cd deep-agents-ui
$ yarn install
$ yarn dev
```

**Deploy a deepagent**

As an example, see our [deepagents quickstart](https://github.com/langchain-ai/deepagents-quickstarts/tree/main/deep_research) repo for an example and run the `deep_research` example.

The `langgraph.json` file has the assistant ID as the key:

```
  "graphs": {
    "research": "./agent.py:agent"
  },
```

Kick off the local LangGraph deployment:

```bash
$ cd deepagents-quickstarts/deep_research
$ langgraph dev
```

You will see the local LangGraph deployment log to terminal:

```
╦  ┌─┐┌┐┌┌─┐╔═╗┬─┐┌─┐┌─┐┬ ┬
║  ├─┤││││ ┬║ ╦├┬┘├─┤├─┘├─┤
╩═╝┴ ┴┘└┘└─┘╚═╝┴└─┴ ┴┴  ┴ ┴

- 🚀 API: http://127.0.0.1:2024
- 🎨 Studio UI: https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024
- 📚 API Docs: http://127.0.0.1:2024/docs
...
```

You can get the Deployment URL and Assistant ID from the terminal output and `langgraph.json` file, respectively:

- Deployment URL: http://127.0.1:2024
- Assistant ID: `research`

**환경변수 설정**

애플리케이션은 환경변수를 통해 설정됩니다. `.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_DEPLOYMENT_URL=http://your-deployment-url:port
NEXT_PUBLIC_ASSISTANT_ID=agent
NEXT_PUBLIC_LANGSMITH_API_KEY=lsv2_pt_xxxxx
NEXT_PUBLIC_LANGSMITH_PROJECT_NAME=your_project_name
NEXT_PUBLIC_LANGSMITH_PROJECT_ID=your_project_id
DAILY_COST_LIMIT=10.0
```

**애플리케이션 실행** at [http://localhost:3000](http://localhost:3000)

**사용법**

채팅 인터페이스를 통해 에이전트와 대화할 수 있습니다. 설정은 환경변수를 통해 관리됩니다.

<img width="2039" height="1495" alt="Screenshot 2025-11-17 at 1 11 27 PM" src="https://github.com/user-attachments/assets/50e1b5f3-a626-4461-9ad9-90347e471e8c" />

As the deepagent runs, you can see its files in LangGraph state.

<img width="2039" height="1495" alt="Screenshot 2025-11-17 at 1 11 36 PM" src="https://github.com/user-attachments/assets/86cc6228-5414-4cf0-90f5-d206d30c005e" />

You can click on any file to view it.

<img width="2039" height="1495" alt="Screenshot 2025-11-17 at 1 11 40 PM" src="https://github.com/user-attachments/assets/9883677f-e365-428d-b941-992bdbfa79dd" />

### 주요 기능

- ✅ **실시간 채팅**: LangGraph SDK를 통한 스트리밍 응답
- ✅ **비용 제한**: 일일 비용 제한 기능으로 사용량 관리
- ✅ **동적 로딩**: 메시지 생성 중 시각적 피드백
- ✅ **에러 처리**: 사용자 친화적 에러 메시지

### Docker 배포

```bash
# 개발 환경
docker-compose up --build

# 프로덕션 환경
docker-compose -f docker-compose.prod.yml up --build -d
```

자세한 내용은 [README.docker.md](./README.docker.md)를 참조하세요.

### 비용 제한 시스템

애플리케이션은 LangSmith API를 통해 누적 비용을 추적하고, 설정된 일일 비용 제한을 초과하면 메시지 전송을 차단합니다.

- 환경변수 `DAILY_COST_LIMIT`로 제한 금액 설정 (기본값: 10.0)
- 10분간 캐싱하여 API 호출 최적화
- Rate Limit 방지 메커니즘 내장

### 📚 Resources

If the term "Deep Agents" is new to you, check out these videos!
[What are Deep Agents?](https://www.youtube.com/watch?v=433SmtTc0TA)
[Implementing Deep Agents](https://www.youtube.com/watch?v=TTMYJAw5tiA&t=701s)
