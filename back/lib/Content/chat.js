const {CHAD_TOKEN} = process.env

const openai2chad = async function (rq) {
    const [message, ...history] = rq.messages
    return {
        message: message.content,
        history,
    }
}

const chad2openai = async function (rp) {
    if (!rp.is_success) {
        return {
            error: {
                message: rp.error_message,
                type: rp.error_code,
                param: null,
                code: rp.error_code
          }
        }
    }

    const created = Math.floor(new Date ().getTime() / 1000)
    return {
    "id": `chatcmpl-${created}`,
    "object": "chat.completion",
    created,
    "model": "gpt-4o",
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": rp.response
        },
        "index": 0,
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": rp.used_tokens_count,
      "completion_tokens": rp.used_tokens_count,
      "total_tokens": rp.used_tokens_count
    }
  }
}

module.exports = {

allowAnonymous: true,

////////////////////////////////////////////////////////////////////////////////

doCompletions:

    async function () {
        const rqChad = await openai2chad(this.request)
        const api_key = CHAD_TOKEN
        const rq = {...rqChad, api_key}
        const rp_raw = await fetch(`https://ask.chadgpt.ru/api/public/gpt-4o-mini`, {
            method: 'POST',
            body: JSON.stringify (rq),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const rp_json = await rp_raw.json ()

        const rp_ai = await chad2openai (rp_json)
        console.log ({rq, rp_json, rp_ai})
        return rp_ai
    },

}