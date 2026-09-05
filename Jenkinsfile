pipeline {
    agent any

    environment {
        IMAGE_NAME = 'foodie-react-app'
        CONTAINER_NAME = 'foodie-react-app'
    }

    stages {

        stage('Build') {
            steps {
                sh '''
                    echo "Building ${IMAGE_NAME}:${BUILD_NUMBER}"

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

        stage('Deploy') {
            steps {
                sh '''
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        --add-host=host.docker.internal:host-gateway \
                        -p 127.0.0.1:9060:80 \
                        ${IMAGE_NAME}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                    sleep 3

                    echo "Running container:"
                    docker ps --filter "name=${CONTAINER_NAME}"

                    echo "Testing application:"
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
            echo "foodie-react-app:${BUILD_NUMBER} deployed successfully."
        }

        failure {
            echo "foodie-react-app:${BUILD_NUMBER} deployment failed."

            sh '''
                docker ps -a --filter "name=${CONTAINER_NAME}"
                docker logs ${CONTAINER_NAME} || true
            '''
        }
    }
}