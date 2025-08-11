const {CHAD_TOKEN} = process.env

const openai2chad = async function (rq) {
    const [message, ...history] = rq.messages
    return {
        message: message.content,
        history,
    }
}

const chad2openai = async function (rp, model) {
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
    "id": `cmpl-${created}`,
    "object": "chat.completion",
    created,
    "model": model,
    "choices": [
      {
        "message": {
          "role": "assistant",
          "content": rp.response
        },
        "index": 0,
        "logprobs": null,
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": rp.used_words_count,
      "completion_tokens": rp.used_words_count,
      "total_tokens": rp.used_words_count
    }
  }
}

module.exports = {

allowAnonymous: true,

////////////////////////////////////////////////////////////////////////////////

doCompletions:

    async function () {
        const headers = this.http.request.headers
        const authorization = headers.authorization
        const api_key = authorization? authorization.split (' ')[1]: this.conf.CHAD_TOKEN
        console.log ({headers})

        if (!api_key) throw new Error ('CHAD_TOKEN is not defined')

        const rqChad = await openai2chad(this.request)
        const rq = {...rqChad, api_key}
        const {model, url} = this.conf
        const rp_raw = await fetch(`${url}/${model}`, {
            method: 'POST',
            body: JSON.stringify (rq),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const rp_json = await rp_raw.json ()

        const rp_ai = await chad2openai (rp_json, model)
        console.log ({rq, rp_json, rp_ai})
        return rp_ai
    },

}