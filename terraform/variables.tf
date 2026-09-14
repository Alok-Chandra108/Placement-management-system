variable "aws_region" {
  description = "The AWS region to deploy the infrastructure in"
  type        = string
  default     = "ap-south-1" # Mumbai region. Change this if you prefer a different region.
}

variable "instance_type" {
  description = "The EC2 instance type (t3.micro is free-tier eligible in newer accounts)"
  type        = string
  default     = "t3.micro"
}
