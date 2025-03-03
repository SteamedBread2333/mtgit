<h1 align="center">
  <br/>
    <img width="268" alt="mt-git-logo" src="https://github.com/user-attachments/assets/fa9c114f-5c7f-4d66-9449-494e1fedda60" />
  <br/>
</h1>

# mtgit
🤜🏼 When a project is maintained in two repositories and one of the repositories restricts the current user's ability to use Git, welcome use this tool.

## Detailed Explanation
In some collaborative development scenarios, a project may be split across two Git repositories, such as for separating code between **development and production environments** or isolating sensitive data. In these cases, one repository may have **access restrictions** for certain users, limiting their ability to perform Git operations like commits, pushes, or cloning. To address this, specialized tools can be used to **sync changes**, **manage branches**, or **automate commit transfers** between the restricted and unrestricted repositories, ensuring a seamless workflow.

## Installation
Nodejs is required and Download the project.

## Instructions for use
![manual_merge_process drawio](https://github.com/user-attachments/assets/b15fc392-2834-4a84-98ca-d78e6563fed9)
- You have to know what's going on.
- You have to know what you're doing with this tool.

## Configuration Parameters Documentation
```json
{
  "mtRepos": [
    "", // Local path of the source repository (repo from)
    "" // Local path of the target repository (repo to)
  ],
  "commitRange": [
    "", // Starting commit in the source repository (repo from) to be merged
    "" // Ending commit in the source repository (repo from) to be merged
  ],
  "needValdateGit": false, // Whether to validate the Git status
  "repoToFlagCommit": "", // Commit in the target repository (repo to) to be flagged, usually corresponding to the starting commit of commitRange
  "publicPaths": ["", ""] // File paths to be synchronized between the source and target repositories, used to resolve inconsistencies in relative paths between the two repositories
}
```

## Usage
Run the following command:
```bash
npm start
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
MIT
