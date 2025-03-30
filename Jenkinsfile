pipeline {
    agent any
    tools {
        nodejs "NodeJS_LTS"
    }
    stages {
        stage('Checkout Code') {
            steps {
                // Adjust the repository URL if necessary.
                git url: 'https://github.com/MLinh204/Cypress---Auto-Test.git', branch: 'main'
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Cypress Tests') {
            steps {
                sh 'npx cypress run --browser chrome'
            }
        }
    }
}
