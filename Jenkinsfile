pipeline {
    agent any

    stages {

        stage('Stop Old Container') {
            steps {
                sh '''
                    docker compose down || true
                    docker rm -f foodie-react-app || true
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    docker compose build
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose up -d
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    sleep 3

                    docker ps --filter "name=foodie-react-app"

                    curl --fail \
                      --retry 5 \
                      --retry-delay 2 \
                      http://127.0.0.1:9060
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    docker image prune -f
                '''
            }
        }
    }

    post {
        success {
            echo 'foodie-react-app deployed successfully.'
        }

        failure {
            echo 'foodie-react-app deployment failed.'

            sh '''
                docker ps -a --filter "name=foodie-react-app"
                docker logs foodie-react-app || true
            '''
        }
    }
}