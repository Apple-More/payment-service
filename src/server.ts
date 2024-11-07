import app from './app';
import { PORT } from './config';

app.listen(PORT, () => {
  console.log(`payment service is running on port ${PORT}`);
});