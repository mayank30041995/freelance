
import groovy.json.JsonOutput

def readCommitAuthor() {
    return sh(
        script: "git show -s --format='%aN <%aE>' HEAD",
        returnStdout: true
    ).trim()
}

def durationTime(m1, m2) {
    long elapsed = (m2 as long) - (m1 as long)

    if (elapsed < 0) {
        error("End time cannot be earlier than start time")
    }

    long totalSeconds = (long) (elapsed / 1000)

    long seconds = totalSeconds % 60
    long minutes = (long) (totalSeconds / 60) % 60
    long hours = (long) (totalSeconds / 3600)

    return "${hours}h ${minutes}m ${seconds}s"
}

def findPodsFromName(String namespace, String name) {
    def podsRaw = sh(
        script: """
            kubectl get pods \
                -n "${namespace}" \
                -l "app=${name}" \
                -o jsonpath='{range .items[*]}{.metadata.name}{"\\n"}{end}'
        """,
        returnStdout: true
    ).trim()

    if (!podsRaw) {
        return []
    }

    return podsRaw.readLines()
}

def notifySlack(String text, String channel, List attachments) {

    def payload = JsonOutput.toJson([
        text: text,
        attachments: attachments
    ])

    withCredentials([
        string(
            credentialsId: 'slack-webhook',
            variable: 'SLACK_WEBHOOK'
        )
    ]) {

        writeFile(
            file: 'slack-payload.json',
            text: payload
        )

        try {
            sh '''
                set +x

                curl --fail --silent --show-error \
                    --connect-timeout 10 \
                    --max-time 30 \
                    -X POST "$SLACK_WEBHOOK" \
                    -H "Content-Type: application/json" \
                    --data @slack-payload.json
            '''
        } finally {
            sh 'rm -f slack-payload.json'
        }
    }
}

return this
