# ifetch
Ifetch is the same as the `fetch` browser API but also it has the feature to intercept request and response.

```typescript
import ifetch from 'ifetch'

ifetch.interceptor.register({
  id: "ID for this interceptors",
  phases: {
    request(input: RequestInfo, init?: RequestInit) {
      
      return {input, init}
    },
    response(response: Response) {

      return response;
    }
  }
})
```
# Async Interceptors
Iftech interceptor can be async function in other words, for example ‍it can block sending the request if it's a `async request` phase interceptor.<br/>
Response phase 