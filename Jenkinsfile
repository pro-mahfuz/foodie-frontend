pipeline {
    agent any

    environment {
        IMAGE_NAME = 'foodie-react-app'
        CONTAINER_NAME = 'foodie-react-app'
    }

    stages {

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t ${IMAGE_NAME}:${BUILD_NUMBER} \
                      -t ${IMAGE_NAME}:latest \
                      .
                '''
            }
        }

        stage('Stop Old Container') {
            steps {
                sh '''
                    docker rm -f ${CONTAINER_NAME} || true
                '''
            }
        }

        stage('Check Port') {
            steps {
                sh '''
                    if ss -lnt | grep -q ':9060 '; then
                        echo "Port 9060 is already in use"
                        docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"
                        exit 1
                    fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker run -d \
                      --name ${CONTAINER_NAME} \
                      --restart unless-stopped \
                      -p 9060:80 \
                      ${IMAGE_NAME}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    sleep 3

                    curl --fail \
                      --retry 5 \
                      --retry-delay 2 \
                      http://72.61.114.40:9060/
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
            echo 'Deployment successful.'
        }

        failure {
            echo 'Deployment failed.'

            sh '''
                docker logs ${CONTAINER_NAME} || true
                docker ps -a
            '''
        }
    }
}